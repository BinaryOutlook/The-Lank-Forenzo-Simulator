import { formatMetricValue, metricLabels } from "../../lib/formatters";
import type { MetricKey, RunMetrics } from "../../simulation/state/types";
import styles from "./MetricRail.module.css";

interface MetricRailProps {
  metrics: RunMetrics;
}

const railOrder: MetricKey[] = [
  "airlineCash",
  "personalWealth",
  "debt",
  "stockPrice",
  "workforceSize",
  "workforceMorale",
  "marketConfidence",
  "creditorPatience",
  "legalHeat",
  "safetyIntegrity",
  "publicAnger",
  "offshoreReadiness",
];

function getMeterValue(metric: MetricKey, value: number): number | null {
  if (metric === "workforceSize") {
    return Math.min(100, value / 120);
  }

  if (metric === "stockPrice") {
    return Math.min(100, value * 2);
  }

  if (metric === "debt") {
    return Math.min(100, value / 12);
  }

  if (metric === "airlineCash" || metric === "personalWealth") {
    return Math.min(100, Math.max(0, value / 3));
  }

  if (metric in metricsAsGauge) {
    return value;
  }

  return null;
}

const metricsAsGauge: Record<string, true> = {
  workforceMorale: true,
  marketConfidence: true,
  creditorPatience: true,
  legalHeat: true,
  safetyIntegrity: true,
  publicAnger: true,
  offshoreReadiness: true,
};

export function MetricRail({ metrics }: MetricRailProps) {
  return (
    <aside className={styles.rail}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Run state</p>
        <h2 className={styles.title}>Two ledgers. One slow collapse.</h2>
      </div>

      <div className={styles.metrics}>
        {railOrder.map((metric) => {
          const value = metrics[metric];
          const meterValue = getMeterValue(metric, value);

          return (
            <div key={metric} className={styles.metricRow}>
              <div className={styles.metricMeta}>
                <span className={styles.metricLabel}>{metricLabels[metric]}</span>
                <span className={styles.metricValue}>{formatMetricValue(metric, value)}</span>
              </div>
              {meterValue !== null ? (
                <div className={styles.meter} aria-hidden="true">
                  <span
                    className={metric === "legalHeat" || metric === "publicAnger" ? styles.meterDanger : styles.meterFill}
                    style={{ width: `${meterValue}%` }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
