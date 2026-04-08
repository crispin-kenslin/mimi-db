from datetime import datetime
from html import escape
from urllib.parse import quote

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from pathlib import Path
from typing import List, Dict

router = APIRouter(prefix="/files", tags=["files"])

# Base data directory
DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"
VALID_DATA_TYPES = ["genomics", "transcriptomics", "metabolomics", "other"]

def get_file_size_str(size_bytes: int) -> str:
    """Convert bytes to human-readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"


def build_index_for_directory(crop_name: str, data_type: str) -> List[Dict]:
    dir_path = DATA_DIR / crop_name / data_type
    if not dir_path.exists() or not dir_path.is_dir():
        return []

    files: List[Dict] = []
    for item in dir_path.rglob("*"):
        if item.is_file() and not item.name.startswith('.'):
            stats = item.stat()
            relative_file_path = item.relative_to(dir_path).as_posix()
            files.append({
                "name": relative_file_path,
                "size": stats.st_size,
                "size_str": get_file_size_str(stats.st_size),
                "modified": stats.st_mtime,
                "path": f"/api/files/download/{crop_name}/{data_type}/{quote(relative_file_path, safe='/')}"
            })

    files.sort(key=lambda x: x["name"])
    return files

@router.get("/list/{crop_name}/{data_type}")
async def list_files(crop_name: str, data_type: str) -> List[Dict]:
    """
    List all files in a specific crop's data folder
    
    Args:
        crop_name: Name of the crop (e.g., 'pearl-millet')
        data_type: Type of data (genomics, transcriptomics, metabolomics, other)
    
    Returns:
        List of file information dictionaries
    """
    if data_type not in VALID_DATA_TYPES:
        raise HTTPException(status_code=400, detail="Invalid data type")

    try:
        return build_index_for_directory(crop_name, data_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")


@router.get("/index/{crop_name}")
async def index_crop_files(crop_name: str) -> Dict:
    """Return indexed file listing for all data types of one crop."""
    crop_path = DATA_DIR / crop_name
    if not crop_path.exists() or not crop_path.is_dir():
        raise HTTPException(status_code=404, detail="Crop folder not found")

    indexed = {data_type: build_index_for_directory(crop_name, data_type) for data_type in VALID_DATA_TYPES}
    total_files = sum(len(v) for v in indexed.values())

    return {
        "crop": crop_name,
        "total_files": total_files,
        "data_types": indexed,
    }


@router.get("/index")
async def index_all_files() -> Dict:
    """Return indexed file listing for all crops and all data types."""
    if not DATA_DIR.exists() or not DATA_DIR.is_dir():
        return {"total_files": 0, "crops": {}}

    crops: Dict = {}
    for crop_dir in DATA_DIR.iterdir():
        if crop_dir.is_dir() and not crop_dir.name.startswith('.'):
            indexed = {data_type: build_index_for_directory(crop_dir.name, data_type) for data_type in VALID_DATA_TYPES}
            crops[crop_dir.name] = {
                "total_files": sum(len(v) for v in indexed.values()),
                "data_types": indexed,
            }

    return {
        "total_files": sum(crops[crop]["total_files"] for crop in crops),
        "crops": crops,
    }


@router.get("/ftp/{crop_name}", response_class=HTMLResponse)
async def ftp_crop_browser(crop_name: str) -> str:
    """Serve a browser-friendly FTP-style listing page for one crop."""
    index = await index_crop_files(crop_name)

    sections = []
    for data_type in VALID_DATA_TYPES:
        files = index["data_types"].get(data_type, [])
        if not files:
            sections.append(f"<h3>{escape(data_type.title())}</h3><p>No files found.</p>")
            continue

        rows = []
        for file in files:
            modified = datetime.fromtimestamp(file["modified"]).strftime("%Y-%m-%d %H:%M")
            rows.append(
                f"<tr><td><a href='{escape(file['path'])}'>{escape(file['name'])}</a></td>"
                f"<td>{escape(file['size_str'])}</td><td>{modified}</td></tr>"
            )
        table = (
            f"<h3>{escape(data_type.title())}</h3>"
            "<table><thead><tr><th>File</th><th>Size</th><th>Modified</th></tr></thead>"
            f"<tbody>{''.join(rows)}</tbody></table>"
        )
        sections.append(table)

    return f"""
    <!doctype html>
    <html>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>MIMI FTP - {escape(crop_name)}</title>
        <style>
          body {{ font-family: Segoe UI, Arial, sans-serif; margin: 24px; color: #1f2937; }}
          h1 {{ margin-bottom: 6px; }}
          .meta {{ color: #4b5563; margin-bottom: 20px; }}
          h3 {{ margin-top: 24px; margin-bottom: 8px; color: #065f46; }}
          table {{ width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e5e7eb; }}
          th, td {{ text-align: left; padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }}
          th {{ background: #f9fafb; font-weight: 600; }}
          a {{ color: #047857; text-decoration: none; }}
          a:hover {{ text-decoration: underline; }}
        </style>
      </head>
      <body>
        <h1>MIMI Data FTP Index: {escape(crop_name)}</h1>
        <p class='meta'>Total files indexed: {index['total_files']}</p>
        {''.join(sections)}
      </body>
    </html>
    """

@router.get("/download/{crop_name}/{data_type}/{file_path:path}")
async def download_file(crop_name: str, data_type: str, file_path: str):
    """
    Download a specific file
    
    Args:
        crop_name: Name of the crop (e.g., 'pearl-millet')
        data_type: Type of data (genomics, transcriptomics, metabolomics, other)
        file_path: Relative path of the file to download
    
    Returns:
        File response for download
    """
    # Construct the file path
    resolved_path = DATA_DIR / crop_name / data_type / file_path
    
    # Security check: ensure the path is within DATA_DIR
    try:
        resolved_path = resolved_path.resolve()
        base_dir = DATA_DIR.resolve()
        if not str(resolved_path).startswith(str(base_dir)):
            raise HTTPException(status_code=403, detail="Access denied")
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid path")
    
    # Check if file exists
    if not resolved_path.exists() or not resolved_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Return the file
    return FileResponse(
        path=str(resolved_path),
        filename=resolved_path.name,
        media_type='application/octet-stream'
    )
