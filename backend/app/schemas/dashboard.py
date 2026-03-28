from pydantic import BaseModel


class DashboardMetricSet(BaseModel):
    symptomLogs: int
    trackedSymptoms: int
    activeMedications: int
    averageSeverity: float


class DashboardChartPoint(BaseModel):
    timestamp: str | None = None
    date: str | None = None
    severity: int | None = None
    averageSeverity: float | None = None
    symptom: str | None = None
    count: int | None = None
    trigger: str | None = None


class DashboardCharts(BaseModel):
    severityTrend: list[DashboardChartPoint]
    dailyAverageSeverity: list[DashboardChartPoint]
    symptomFrequency: list[DashboardChartPoint]
    topTriggers: list[DashboardChartPoint]


class DashboardRecentSymptom(BaseModel):
    id: int
    timestamp: str | None
    symptom: str
    severity: int
    durationHr: float | None
    triggers: list[str]
    relief: list[str]
    notes: str | None


class DashboardMedication(BaseModel):
    id: int
    name: str
    dosage: str | None
    frequency: str | None
    startDate: str | None
    notes: str | None


class DashboardResponse(BaseModel):
    metrics: DashboardMetricSet
    recentSymptoms: list[DashboardRecentSymptom]
    medications: list[DashboardMedication]
    charts: DashboardCharts
