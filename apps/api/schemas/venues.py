from pydantic import BaseModel

class VenueBase(BaseModel):
    name: str
    location: str | None = None

class VenueResponse(VenueBase):
    id: str

    class Config:
        from_attributes = True
