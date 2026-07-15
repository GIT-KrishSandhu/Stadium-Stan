from sqlalchemy.orm import Session
from models import Venue

def get_venues(db: Session):
    return db.query(Venue).all()

def get_venue(db: Session, venue_id: str):
    return db.query(Venue).filter(Venue.id == venue_id).first()
