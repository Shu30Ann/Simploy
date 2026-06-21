from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


Timeframe = Literal["CURRENT", "5Y", "10Y", "20Y", "30Y"]
MarketSupply = Literal["Critical", "Scarce", "Balanced", "Abundant"]
DeptStability = Literal["Critical", "At Risk", "Stable", "Growing"]


class Presets(BaseModel):
    attritionSpike: bool = True
    aiAutomation: bool = True
    hiringFreeze: bool = False
    massRetirement: bool = False


class SimulationInput(BaseModel):
    attritionRate: int = Field(default=12, ge=0, le=60)
    aiLevel: int = Field(default=2, ge=0, le=3)
    hiringBudget: int = Field(default=-2, ge=-10, le=10)
    growthTarget: int = Field(default=8, ge=-20, le=40)
    retirementExtension: int = Field(default=3, ge=0, le=10)
    migrationImpact: int = Field(default=12, ge=-20, le=40)
    presets: Presets = Presets()
    timeframe: Timeframe = "5Y"


class ChartPoint(BaseModel):
    year: str
    supply: int
    demand: int
    net: int


class DeptRisk(BaseModel):
    id: str
    label: str
    abbr: str
    score: int
    stability: DeptStability


class RoleGap(BaseModel):
    role: str
    dept: str
    current: int
    projected: int
    gap: int
    marketSupply: MarketSupply


class SimulationResult(BaseModel):
    chartData: list[ChartPoint]
    resilienceScore: float
    deptRisks: list[DeptRisk]
    projectedGap: int
    costOfInaction: int
    highRiskRoles: int
    roleGaps: list[RoleGap]


class SimulationCreate(BaseModel):
    name: str = "Workforce planning scenario"
    input: SimulationInput = SimulationInput()


class SimulationRecord(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    id: int
    employer_id: int | None
    name: str
    input: SimulationInput
    result: SimulationResult
    model_version: str
    created_at: str
