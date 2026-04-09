import clsx from "clsx";
import { formatMetricValue, metricLabels } from "../../lib/formatters";
import { getMetricMeterTone, getMetricMeterValue } from "../../simulation/state/metricSemantics";
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
          const meterValue = getMetricMeterValue(metric, value);
          const meterTone = getMetricMeterTone(metric);

          return (
            <div key={metric} className={styles.metricRow}>
              <div className={styles.metricMeta}>
                <span className={styles.metricLabel}>{metricLabels[metric]}</span>
                <span className={styles.metricValue}>{formatMetricValue(metric, value)}</span>
              </div>
              {meterValue !== null ? (
                <div className={styles.meter} aria-hidden="true">
                  <span
                    className={clsx(
                      meterTone === "positive" && styles.meterFill,
                      meterTone === "negative" && styles.meterDanger,
                      meterTone === "neutral" && styles.meterNeutral,
                    )}
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
