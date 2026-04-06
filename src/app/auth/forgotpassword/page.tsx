"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CloseEyeIcon, OpenEyeIcon } from '@/src/components/icons/page';
import { requestUserOTP, verifyUserOTP, resetUserPassword } from "@/src/services/auth";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCount, setOtpCount] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requestNewOtp, setRequestNewOtp] = useState(false);
  const [canRequestNewOtp, setCanRequestNewOtp] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await requestUserOTP({ email });
      if (response.status) {
        setSuccess(response.message || "OTP sent to your email.");
        setShowOtp(true);
        setIsTimerActive(true);
        setOtpCount(60);
      } else {
        setError(response.message || "Unable to send OTP.");
      }
    } catch (err) {
      setError("Server error when requesting OTP.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const joinedOtp = otp.join("");
    if (joinedOtp.length !== 6) {
      setError("Please enter 6-digit OTP.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await verifyUserOTP({ email, otp: joinedOtp });
      if (response.status) {
        setSuccess(response.message || "OTP verified. You can now reset your password.");
        setResetPassword(true);
      } else {
        setError(response.message || "OTP verification failed.");
      }
    } catch (err) {
      setError("Server error when verifying OTP.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const joinedOtp = otp.join("");
    if (!joinedOtp) {
      setError("OTP is required to reset password.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await resetUserPassword({ email, otp: joinedOtp, newPassword, confirmPassword });
      if (response.status) {
        setSuccess(response.message || "Password reset successfully.");
        router.push("/dashboard");
      } else {
        setError(response.message || "Reset password failed.");
      }
    } catch (err) {
      setError("Server error when resetting password.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && otpCount > 0) {
      interval = setInterval(() => {
        setOtpCount((prev) => prev - 1);
      }, 1000);
    } else if (otpCount === 0) {
      setIsTimerActive(false);
      setCanRequestNewOtp(true);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, otpCount]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste event
      const pastedValues = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedValues.forEach((val, i) => {
        if (index + i < 6) {
          newOtp[index + i] = val;
        }
      });
      setOtp(newOtp);
    } else {
      // Handle single digit input (including "0")
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/logos/plantleave.png')] bg-cover bg-center filter"></div>
      {/* Overlay for better readability */}
      <div />
      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-6 bg-black/30 backdrop-blur-xs rounded-3xl p-11 border border-white/10 shadow-2xl">
        {/* Card header */}
        <div className="text-center mb-8">
          <h2 className="text-white text-3xl font-bold mb-2">
            ລືມລະຫັດຜ່ານ?
          </h2>
          <p className="text-white text-sm">
            ກະລຸນາໃສ່ທີ່ຢູ່ອີເມວຂອງທ່ານເພື່ອຕັ້ງລະຫັດຜ່ານຂອງທ່ານຄືນໃໝ່
          </p>
        </div>

        {(error || success) && (
          <div className="mb-4 text-center">
            {error ? (
              <p className="text-red-400 bg-red-900/20 p-2 rounded-lg">{error}</p>
            ) : (
              <p className="text-green-400 bg-green-900/20 p-2 rounded-lg">{success}</p>
            )}
          </div>
        )}

        {/* Email field */}
        {!resetPassword && (
          <div className="mb-5">
            <label
              className={`block text-sm font-medium mb-2 transition-colors ${focusedField === "email" ? "text-green-400" : "text-gray-300"
                }`}
            >
              ອີເມວ
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 outline-none transition-all ${focusedField === "email"
                  ? "border-2 border-green-400 ring-2 ring-green-400/20"
                  : "border border-white/10"
                  } bg-black/20`}
              />
            </div>
          </div>
        )}

        {/* Password fields */}
        {resetPassword && (
          <>
            <div className="mb-5">
              <label
                className={`block text-sm font-medium mb-2 transition-colors ${focusedField === "newPassword" ? "text-green-400" : "text-gray-300"
                  }`}
              >
                ລະຫັດຜ່ານໃໝ່
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={() => setFocusedField("newPassword")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter new password"
                  className={`w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 outline-none transition-all ${focusedField === "newPassword"
                    ? "border-2 border-green-400 ring-2 ring-green-400/20"
                    : "border border-white/10"
                    } bg-black/20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <CloseEyeIcon size={20} /> : <OpenEyeIcon size={20} />}
                </button>
              </div>
            </div>
            <div className="mb-5">
              <label
                className={`block text-sm font-medium mb-2 transition-colors ${focusedField === "confirmPassword" ? "text-green-400" : "text-gray-300"
                  }`}
              >
                ຢືນຢັນລະຫັດຜ່ານ
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 outline-none transition-all ${focusedField === "confirmPassword"
                    ? "border-2 border-green-400 ring-2 ring-green-400/20"
                    : "border border-white/10"
                    } bg-black/20`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <CloseEyeIcon size={20} /> : <OpenEyeIcon size={20} />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* OTP field */}
        {showOtp && !resetPassword && (
          <div className="mb-5">
            <div className="flex justify-between items-center">
              <label
                className={`block text-sm font-medium mb-2 transition-colors ${focusedField?.startsWith("otp-") ? "text-green-400" : "text-gray-300"
                  }`}
              >
                OTP
              </label>
              <label className={`text-xs text-gray-400 ${isTimerActive ? "text-green-400" : "text-red-400"}`}>
                {isTimerActive ? `${otpCount}s` : otpCount === 0 && "OTP expired"}
              </label>
            </div>
            <div className="flex gap-2 justify-between">
              {otp.map((value, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={value}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={() => setFocusedField(`otp-${index}`)}
                  onBlur={() => setFocusedField(null)}
                  maxLength={1}
                  disabled={otpCount === 0}
                  className={`w-12 h-12 rounded-xl text-white text-xl font-semibold text-center outline-none transition-all ${focusedField === `otp-${index}`
                    ? "border-2 border-green-400 ring-2 ring-green-400/20"
                    : "border border-white/10"
                    } ${otpCount === 0 ? "bg-gray-800/50 cursor-not-allowed opacity-50" : "bg-black/20"}`}
                />
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            if (!showOtp && !resetPassword) {
              handleForgotPassword();
            } else if (showOtp && !resetPassword && otpCount > 0 && isTimerActive) {
              handleVerifyOtp();
            } else if ((otpCount === 0 || !isTimerActive) && !resetPassword) {
              handleForgotPassword();
            } else if (resetPassword) {
              handleChangePassword();
            }
          }}
          disabled={isLoading}
          className={`w-full font-semibold py-3 rounded-xl transition-all shadow-lg transform ${isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-white text-black hover:bg-gray-100 hover:scale-[1.02]"
            }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span>ກຳລັງດຳເນີນ...</span>
            </div>
          ) : !showOtp && !resetPassword ? (
            "ຢືນຢັນ"
          ) : showOtp && !resetPassword && otpCount > 0 && isTimerActive ? (
            "ຢືນຢັນ OTP"
          ) : (otpCount === 0 || !isTimerActive) && !resetPassword ? (
            "ຂໍ OTP ໃໝ່"
          ) : resetPassword ? (
            "ຢືນຢັນ"
          ) : (
            "ຢືນຢັນ"
          )}
        </button>

        {/* Back to login */}
        <div className="mt-6 text-center flex justify-end">
          <Link
            href="/auth/login"
            className="text-white text-sm hover:text-green-400 transition-colors"
          >
            ກັບໄປໜ້າລັອກອິນ
          </Link>
        </div>
      </div>
    </div>
  );
}