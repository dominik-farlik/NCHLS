from sqlmodel import Field, SQLModel


class Substance(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    mixture: bool | None = Field(default=True, description="Identifikuje zda se jedná o látku(false) nebo směs(true)")
    physical_form: str | None = Field(foreign_key="physical_form.name", description="Fyzikální forma (pevná, kapalná, plynná)")
    unit: str | None = Field(foreign_key="unit.name", description="Jednotka (g, kg, ml, l)")
    sds_revision_year: int | None = Field(description="Rok revize bezpečnostního listu")
    note: str | None = Field("Dodatečná informace o látce, např. desinfekce, IPLP, analyz.")
    water_toxicity_ec50: str | None = Field(description="Koncentrace při 50% úmrtí testovaných jedinců")
    manufacturer: str | None = Field(description="Výrobce látky nebo směsi")
    code: str | None = Field(unique=True, description="Kód látky (pro OKL, nejspíš bude odstraněno)")
    company_id: int | None = Field(foreign_key="company.id")
    sds: bool = Field(default=False)