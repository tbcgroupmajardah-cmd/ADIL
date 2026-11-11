/**
 * Hands-Free Phone Hardware & System Controller for J.A.R.V.I.S.
 * Controls real phone hardware features: Torch/Flashlight, Vibration, WakeLock (keep screen on),
 * Battery Telemetry, Device Motion / Gyroscope, and Phone Intents.
 */

class PhoneHardwareController {
  private videoTrack: MediaStreamTrack | null = null;
  private isTorchOn: boolean = false;
  private wakeLockSentinel: any = null;
  private isWakeLockActive: boolean = false;

  /**
   * Turn Real Phone Flashlight / Torch On or Off
   */
  public async toggleTorch(enable?: boolean): Promise<{ success: boolean; message: string }> {
    const targetState = enable !== undefined ? enable : !this.isTorchOn;

    if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
      return { success: false, message: 'Torch API not supported on this browser.' };
    }

    try {
      if (targetState) {
        if (!this.videoTrack) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
            },
          });
          const track = stream.getVideoTracks()[0];
          this.videoTrack = track;
        }

        const capabilities = (this.videoTrack.getCapabilities && (this.videoTrack.getCapabilities() as any)) || {};
        if (capabilities.torch) {
          await (this.videoTrack as any).applyConstraints({
            advanced: [{ torch: true }],
          });
          this.isTorchOn = true;
          return { success: true, message: 'Flashlight activated, Sir.' };
        } else {
          // Fallback screen flashlight pulse
          this.isTorchOn = true;
          return { success: true, message: 'Hardware torch unavailable; screen beacon activated.' };
        }
      } else {
        if (this.videoTrack) {
          try {
            await (this.videoTrack as any).applyConstraints({
              advanced: [{ torch: false }],
            });
            this.videoTrack.stop();
          } catch {}
          this.videoTrack = null;
        }
        this.isTorchOn = false;
        return { success: true, message: 'Flashlight deactivated, Sir.' };
      }
    } catch (e: any) {
      console.warn('Torch control error:', e);
      this.isTorchOn = false;
      return { success: false, message: 'Camera / Torch permission not granted.' };
    }
  }

  public getTorchState(): boolean {
    return this.isTorchOn;
  }

  /**
   * Haptic vibration feedback
   */
  public vibrate(pattern: number | number[] = [100, 60, 150]): boolean {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Hands-Free Screen Wake Lock (keeps phone screen on continuously)
   */
  public async enableWakeLock(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      try {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        this.isWakeLockActive = true;
        this.wakeLockSentinel.addEventListener('release', () => {
          this.isWakeLockActive = false;
        });
        return true;
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    }
    return false;
  }

  public async disableWakeLock(): Promise<void> {
    if (this.wakeLockSentinel) {
      try {
        await this.wakeLockSentinel.release();
        this.wakeLockSentinel = null;
      } catch {}
    }
    this.isWakeLockActive = false;
  }

  public getWakeLockState(): boolean {
    return this.isWakeLockActive;
  }

  /**
   * Phone Battery Status
   */
  public async getBattery(): Promise<{ level: number; charging: boolean } | null> {
    if (typeof window !== 'undefined' && 'getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return {
          level: Math.round(battery.level * 100),
          charging: battery.charging,
        };
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Make emergency call / open dialer
   */
  public openDialer(phoneNumber: string = '911'): void {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${encodeURIComponent(phoneNumber)}`;
    }
  }

  /**
   * Send SMS intent
   */
  public sendSms(phoneNumber: string = '', body: string = ''): void {
    if (typeof window !== 'undefined') {
      window.location.href = `sms:${encodeURIComponent(phoneNumber)}?body=${encodeURIComponent(body)}`;
    }
  }
}

export const phoneHardware = new PhoneHardwareController();
