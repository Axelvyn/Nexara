// Temporary user storage for unverified registrations
// In production, this should use Redis or a dedicated temporary table

class TempUserStorage {
  constructor() {
    // In-memory storage for development
    // TODO: Replace with Redis in production
    this.tempUsers = new Map();

    // Cleanup expired entries every 30 minutes
    setInterval(
      () => {
        this.cleanupExpired();
      },
      30 * 60 * 1000
    );
  }

  store(email, userData, otpData) {
    const key = email.toLowerCase();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    this.tempUsers.set(key, {
      ...userData,
      ...otpData,
      expiresAt,
      createdAt: new Date(),
    });

    console.log(`📝 Stored temporary user: ${email}`);
  }

  get(email) {
    const key = email.toLowerCase();
    const userData = this.tempUsers.get(key);

    if (!userData) {
      return null;
    }

    // Check if expired
    if (new Date() > userData.expiresAt) {
      this.tempUsers.delete(key);
      return null;
    }

    return userData;
  }

  updateOtp(email, otp, otpExpiresAt) {
    const key = email.toLowerCase();
    const userData = this.tempUsers.get(key);

    if (!userData) {
      return false;
    }

    userData.emailVerificationOtp = otp;
    userData.otpExpiresAt = otpExpiresAt;
    userData.updatedAt = new Date();

    return true;
  }

  remove(email) {
    const key = email.toLowerCase();
    const existed = this.tempUsers.has(key);
    this.tempUsers.delete(key);

    if (existed) {
      console.log(`🗑️ Removed temporary user: ${email}`);
    }

    return existed;
  }

  cleanupExpired() {
    const now = new Date();
    let cleanedCount = 0;

    for (const [email, userData] of this.tempUsers.entries()) {
      if (now > userData.expiresAt) {
        this.tempUsers.delete(email);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired temporary users`);
    }
  }

  // Get all temporary users (for debugging)
  getAll() {
    return Array.from(this.tempUsers.entries()).map(([email, data]) => ({
      email,
      ...data,
    }));
  }

  // Get statistics
  getStats() {
    const now = new Date();
    let active = 0;
    let expired = 0;

    for (const userData of this.tempUsers.values()) {
      if (now > userData.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.tempUsers.size,
      active,
      expired,
    };
  }
}

// Export singleton instance
module.exports = new TempUserStorage();
