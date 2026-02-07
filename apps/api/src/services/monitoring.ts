/**
 * Database Performance Monitoring Service
 *
 * Provides comprehensive monitoring and performance metrics for the Blueprintify database.
 * Includes query performance tracking, health checks, and optimization recommendations.
 */

export interface DatabaseMetrics {
  // Performance metrics
  queryTime: {
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  };

  // Connection metrics
  connections: {
    active: number;
    idle: number;
    max: number;
    utilization: number;
  };

  // Storage metrics
  storage: {
    totalSize: number;
    usedSize: number;
    freeSize: number;
    tableSizes: Record<string, number>;
  };

  // Cache metrics
  cache: {
    hitRate: number;
    missRate: number;
    evictions: number;
    size: number;
  };

  // Index metrics
  indexes: {
    usageStats: Array<{
      tableName: string;
      indexName: string;
      usageCount: number;
      efficiency: number;
    }>;
    unusedIndexes: string[];
  };

  // Error metrics
  errors: {
    total: number;
    rate: number;
    types: Record<string, number>;
    recentErrors: Array<{
      error: string;
      timestamp: Date;
      query: string;
    }>;
  };
}

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  score: number; // 0-100
  checks: {
    connectivity: boolean;
    performance: boolean;
    storage: boolean;
    integrity: boolean;
  };
  issues: string[];
  recommendations: string[];
}

export interface QueryPerformanceReport {
  query: string;
  executionTime: number;
  rowsExamined: number;
  rowsReturned: number;
  indexesUsed: string[];
  fullTableScans: boolean;
  recommendations: string[];
}

export class DatabaseMonitoringService {
  private metrics: DatabaseMetrics;
  private queryHistory: Array<{
    query: string;
    timestamp: Date;
    executionTime: number;
    success: boolean;
  }> = [];

  private readonly MAX_HISTORY_SIZE = 10000;
  private readonly PERFORMANCE_THRESHOLD_MS = 100;
  private readonly SLOW_QUERY_THRESHOLD_MS = 500;

  constructor() {
    this.metrics = this.initializeMetrics();
  }

  /**
   * Initialize default metrics
   */
  private initializeMetrics(): DatabaseMetrics {
    return {
      queryTime: { avg: 0, min: 0, max: 0, p95: 0, p99: 0 },
      connections: { active: 0, idle: 0, max: 100, utilization: 0 },
      storage: {
        totalSize: 0,
        usedSize: 0,
        freeSize: 0,
        tableSizes: {},
      },
      cache: { hitRate: 0, missRate: 0, evictions: 0, size: 0 },
      indexes: {
        usageStats: [],
        unusedIndexes: [],
      },
      errors: {
        total: 0,
        rate: 0,
        types: {},
        recentErrors: [],
      },
    };
  }

  /**
   * Record query execution for monitoring
   */
  recordQuery(
    query: string,
    executionTime: number,
    success: boolean = true,
    error?: string,
  ): void {
    const record = {
      query,
      timestamp: new Date(),
      executionTime,
      success,
    };

    // Add to history
    this.queryHistory.push(record);

    // Trim history if needed
    if (this.queryHistory.length > this.MAX_HISTORY_SIZE) {
      this.queryHistory = this.queryHistory.slice(-this.MAX_HISTORY_SIZE);
    }

    // Update metrics
    this.updateQueryMetrics(executionTime, success, error);

    // Log slow queries
    if (executionTime > this.SLOW_QUERY_THRESHOLD_MS) {
      console.warn(`Slow query detected (${executionTime}ms):`, query);
    }
  }

  /**
   * Update query performance metrics
   */
  private updateQueryMetrics(
    executionTime: number,
    success: boolean,
    error?: string,
  ): void {
    const times = this.queryHistory
      .filter((q) => q.success)
      .map((q) => q.executionTime)
      .sort((a, b) => a - b);

    if (times.length > 0) {
      this.metrics.queryTime.avg =
        times.reduce((a, b) => a + b, 0) / times.length;
      this.metrics.queryTime.min = times[0];
      this.metrics.queryTime.max = times[times.length - 1];

      const p95Index = Math.floor(times.length * 0.95);
      const p99Index = Math.floor(times.length * 0.99);
      this.metrics.queryTime.p95 = times[p95Index] ?? 0;
      this.metrics.queryTime.p99 = times[p99Index] ?? 0;
    }

    // Update error metrics
    if (!success && error) {
      this.metrics.errors.total++;
      this.metrics.errors.types[error] =
        (this.metrics.errors.types[error] || 0) + 1;

      this.metrics.errors.recentErrors.push({
        error,
        timestamp: new Date(),
        query:
          this.queryHistory[this.queryHistory.length - 1]?.query || "unknown",
      });

      // Keep only recent errors
      if (this.metrics.errors.recentErrors.length > 50) {
        this.metrics.errors.recentErrors =
          this.metrics.errors.recentErrors.slice(-50);
      }
    }
  }

  /**
   * Perform comprehensive database health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks = {
      connectivity: await this.checkConnectivity(),
      performance: this.checkPerformance(),
      storage: await this.checkStorage(),
      integrity: await this.checkIntegrity(),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const score = (passedChecks / totalChecks) * 100;

    const status =
      score >= 90 ? "healthy" : score >= 70 ? "degraded" : "unhealthy";

    const issues = this.identifyIssues(checks);
    const recommendations = this.generateRecommendations(checks, status);

    return {
      status,
      score,
      checks,
      issues,
      recommendations,
    };
  }

  /**
   * Check database connectivity
   */
  private async checkConnectivity(): Promise<boolean> {
    try {
      // In real implementation, this would execute a simple query
      // For now, simulate connectivity check
      return true;
    } catch (error) {
      console.error("Connectivity check failed:", error);
      return false;
    }
  }

  /**
   * Check performance metrics against thresholds
   */
  private checkPerformance(): boolean {
    return (
      this.metrics.queryTime.avg < this.PERFORMANCE_THRESHOLD_MS &&
      this.metrics.queryTime.p95 < this.PERFORMANCE_THRESHOLD_MS * 2 &&
      this.metrics.connections.utilization < 0.8
    );
  }

  /**
   * Check storage capacity
   */
  private async checkStorage(): Promise<boolean> {
    // In real implementation, this would check actual storage usage
    // For now, simulate storage check
    const utilization =
      this.metrics.storage.usedSize /
      Math.max(this.metrics.storage.totalSize, 1);
    return utilization < 0.9;
  }

  /**
   * Check database integrity
   */
  private async checkIntegrity(): Promise<boolean> {
    try {
      // In real implementation, this would run PRAGMA integrity_check
      // For now, simulate integrity check
      return true;
    } catch (error) {
      console.error("Integrity check failed:", error);
      return false;
    }
  }

  /**
   * Identify issues based on health check results
   */
  private identifyIssues(checks: Record<string, boolean>): string[] {
    const issues: string[] = [];

    if (!checks.connectivity) {
      issues.push("Database connectivity issues detected");
    }

    if (!checks.performance) {
      if (this.metrics.queryTime.avg > this.PERFORMANCE_THRESHOLD_MS) {
        issues.push(
          `Average query time (${this.metrics.queryTime.avg.toFixed(2)}ms) exceeds threshold`,
        );
      }
      if (this.metrics.connections.utilization > 0.8) {
        issues.push(
          `High connection utilization (${(this.metrics.connections.utilization * 100).toFixed(1)}%)`,
        );
      }
    }

    if (!checks.storage) {
      const utilization =
        this.metrics.storage.usedSize /
        Math.max(this.metrics.storage.totalSize, 1);
      issues.push(
        `Storage utilization (${(utilization * 100).toFixed(1)}%) approaching capacity`,
      );
    }

    if (!checks.integrity) {
      issues.push("Database integrity check failed");
    }

    if (this.metrics.errors.recentErrors.length > 10) {
      issues.push(
        `High error rate: ${this.metrics.errors.recentErrors.length} recent errors`,
      );
    }

    return issues;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    checks: Record<string, boolean>,
    status: string,
  ): string[] {
    const recommendations: string[] = [];

    if (!checks.performance) {
      if (this.metrics.queryTime.avg > this.PERFORMANCE_THRESHOLD_MS) {
        recommendations.push(
          "Consider adding indexes for frequently queried columns",
        );
        recommendations.push("Review and optimize slow queries");
      }

      if (this.metrics.cache.hitRate < 0.8) {
        recommendations.push("Increase cache size for better performance");
      }
    }

    if (!checks.storage) {
      recommendations.push("Implement data archival for old records");
      recommendations.push("Consider purging soft-deleted records");
    }

    if (this.metrics.errors.recentErrors.length > 0) {
      recommendations.push("Review recent errors and fix underlying issues");
      recommendations.push("Implement better error handling and retry logic");
    }

    if (status === "degraded") {
      recommendations.push(
        "Schedule database maintenance during off-peak hours",
      );
    }

    if (status === "unhealthy") {
      recommendations.push(
        "Immediate intervention required - contact database administrator",
      );
    }

    // Always include these maintenance recommendations
    recommendations.push("Regular backup verification");
    recommendations.push("Monitor index usage and remove unused indexes");
    recommendations.push("Periodic query plan analysis");

    return recommendations;
  }

  /**
   * Generate query performance report
   */
  generateQueryPerformanceReport(query: string): QueryPerformanceReport {
    const queryStats = this.queryHistory.filter((h) => h.query.includes(query));

    if (queryStats.length === 0) {
      return {
        query,
        executionTime: 0,
        rowsExamined: 0,
        rowsReturned: 0,
        indexesUsed: [],
        fullTableScans: false,
        recommendations: ["No query history available"],
      };
    }

    const avgTime =
      queryStats.reduce((sum, stat) => sum + stat.executionTime, 0) /
      queryStats.length;
    const isSlow = avgTime > this.PERFORMANCE_THRESHOLD_MS;

    const recommendations: string[] = [];
    if (isSlow) {
      recommendations.push(
        "Query execution time exceeds performance threshold",
      );
      recommendations.push("Consider adding appropriate indexes");
      recommendations.push("Review query execution plan");
    }

    return {
      query,
      executionTime: avgTime,
      rowsExamined: 0, // Would be populated from actual query analysis
      rowsReturned: 0, // Would be populated from actual query analysis
      indexesUsed: [], // Would be populated from actual query analysis
      fullTableScans: isSlow, // Heuristic-based assumption
      recommendations,
    };
  }

  /**
   * Get current metrics
   */
  getMetrics(): DatabaseMetrics {
    return { ...this.metrics };
  }

  /**
   * Get query statistics
   */
  getQueryStatistics() {
    const totalQueries = this.queryHistory.length;
    const successfulQueries = this.queryHistory.filter((q) => q.success).length;
    const failedQueries = totalQueries - successfulQueries;

    return {
      total: totalQueries,
      successful: successfulQueries,
      failed: failedQueries,
      successRate:
        totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0,
      avgExecutionTime: this.metrics.queryTime.avg,
      errorRate: totalQueries > 0 ? (failedQueries / totalQueries) * 100 : 0,
    };
  }

  /**
   * Reset metrics (useful for testing or maintenance)
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.queryHistory = [];
  }
}

// Export singleton instance
export const dbMonitoring = new DatabaseMonitoringService();
