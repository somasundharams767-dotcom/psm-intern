import enum


class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"


class ProjectStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    COMPLETED = "completed"
    NEEDS_REVISION = "needs_revision"


class EvaluationStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"


class CertificateStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    ISSUED = "issued"
    REJECTED = "rejected"
    REVOKED = "revoked"


class InternshipStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    TERMINATED = "terminated"
