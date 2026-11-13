DROP INDEX "appointments_scheduleId_key";

CREATE INDEX "appointments_scheduleId_idx" ON "appointments"("scheduleId");

CREATE UNIQUE INDEX "appointments_active_doctor_schedule_key"
ON "appointments"("doctorId", "scheduleId")
WHERE "status" IN ('SCHEDULED', 'INPROGRESS', 'COMPLETED');

UPDATE "doctor_schedules" AS ds
SET "isBooked" = EXISTS (
  SELECT 1
  FROM "appointments" AS a
  WHERE a."doctorId" = ds."doctorId"
    AND a."scheduleId" = ds."scheduleId"
    AND a."status" IN ('SCHEDULED', 'INPROGRESS', 'COMPLETED')
);
