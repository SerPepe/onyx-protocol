pub fn get_precision() -> u128 {
    1_000_000_000
}

// Helper to calculate exp decay approximation
// e^(-lambda * t)
// lambda is scaled by PRECISION (per day)
// t is in days
// Returns scaled factor
pub fn exp_decay(lambda: u128, t_days: u64) -> u128 {
    // Simple linear approximation for small lambda*t: 1 - lambda*t
    // Or Taylor series: 1 - x + x^2/2 ...
    // For this task, let's use a simple linear approx clamped to 0 if lambda*t > 1
    // In production this would be a lookup table or better approx.
    
    let x = lambda * (t_days as u128);
    let precision = get_precision();
    if x >= precision {
        0
    } else {
        precision - x
    }
}

pub fn max(a: u128, b: u128) -> u128 {
    if a > b { a } else { b }
}

pub fn min(a: u128, b: u128) -> u128 {
    if a < b { a } else { b }
}
