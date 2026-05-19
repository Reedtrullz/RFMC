export interface VerticalConstraint {
  waypointIdent: string;
  type: 'AT' | 'AT_OR_ABOVE' | 'AT_OR_BELOW' | 'WINDOW';
  altitudeFt?: number;
  minAltitudeFt?: number;
  maxAltitudeFt?: number;
  speedKt?: number;
}

export interface VnavPath {
  topOfClimbNm?: number;
  topOfDescentNm?: number;
  descentAngleDeg: number;
  requiredVsFpm: number;
  pathDeviationFt: number;
}

export class VerticalProfileEngine {
  /**
   * Computes the distance (NM) to the Top of Descent (T/D).
   * Approximation: 3-degree path is roughly 318 ft per NM.
   */
  public static computeTopOfDescent(currentAltFt: number, targetAltFt: number, descentAngleDeg = 3): number {
    const altitudeDrop = currentAltFt - targetAltFt;
    if (altitudeDrop <= 0) return 0;

    // Gradient (ft/NM) = 6076.1 * tan(angle)
    // For 3 degrees: 6076.1 * 0.0524 = 318.4 ft/NM
    const gradient = 6076.1 * Math.tan((descentAngleDeg * Math.PI) / 180);
    return altitudeDrop / gradient;
  }

  /**
   * Calculates the vertical deviation from the target path.
   */
  public static calculatePathDeviation(
    currentAltFt: number,
    targetAltFt: number,
    distanceToTargetNm: number,
    descentAngleDeg = 3,
  ): number {
    const gradient = 6076.1 * Math.tan((descentAngleDeg * Math.PI) / 180);
    const targetAltAtDistance = targetAltFt + distanceToTargetNm * gradient;
    return currentAltFt - targetAltAtDistance;
  }

  /**
   * Calculates the required vertical speed (FPM) to stay on path.
   */
  public static calculateRequiredVs(groundSpeedKt: number, descentAngleDeg = 3): number {
    // VS (fpm) = GS (kt) * (6076.1 / 60) * tan(angle)
    // For 3 degrees: GS * 101.27 * 0.0524 = GS * 5.3
    return groundSpeedKt * 101.27 * Math.tan((descentAngleDeg * Math.PI) / 180);
  }
}
