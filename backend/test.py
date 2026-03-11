import traceback
from app.database import SessionLocal
from app import models, schemas
db = SessionLocal()
try:
    crops = db.query(models.Crop).offset(0).limit(10).all()
    for c in crops:
        schemas.Crop.from_orm(c)
except Exception as e:
    print(traceback.format_exc())
