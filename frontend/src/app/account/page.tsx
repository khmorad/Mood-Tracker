"use client";

import { FormEvent, useEffect, useState } from "react";
import { getCurrentUser } from "../../utils/auth";
import {
  BadgeCheck,
  CreditCard,
  Loader2,
  Lock,
  Save,
  Settings2,
  UserRound,
} from "lucide-react";

type AccountProfile = {
  user_id: string;
  email: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  preferred_language?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  diagnosis_status?: string | null;
  subscription_tier?: string | null;
  subscription_expires_at?: string | null;
};

type ProfileForm = {
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone_number: string;
  preferred_language: string;
  gender: string;
  date_of_birth: string;
  diagnosis_status: string;
  password: string;
};

const emptyForm: ProfileForm = {
  email: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  phone_number: "",
  preferred_language: "",
  gender: "",
  date_of_birth: "",
  diagnosis_status: "",
  password: "",
};

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }

    const loadAccount = async () => {
      try {
        setLoading(true);
        setError("");

        const profileResponse = await fetch("/api/account/profile");

        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error(profileData.error || "Failed to load profile");
        }

        setProfile(profileData);
        setForm({
          email: profileData.email || "",
          first_name: profileData.first_name || "",
          middle_name: profileData.middle_name || "",
          last_name: profileData.last_name || "",
          phone_number: profileData.phone_number || "",
          preferred_language: profileData.preferred_language || "",
          gender: profileData.gender || "",
          date_of_birth: profileData.date_of_birth || "",
          diagnosis_status: profileData.diagnosis_status || "",
          password: "",
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load account details"
        );
      } finally {
        setLoading(false);
      }
    };

    void loadAccount();
  }, []);

  const handleFieldChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const refreshJwt = async () => {
    await fetch("/api/auth/refresh-token", { method: "POST" });
  };

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        middle_name: form.middle_name.trim() || null,
        last_name: form.last_name.trim(),
        phone_number: form.phone_number.trim() || null,
        preferred_language: form.preferred_language.trim() || null,
        gender: form.gender.trim() || null,
        date_of_birth: form.date_of_birth || null,
        diagnosis_status: form.diagnosis_status.trim() || null,
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
      };

      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile(data);
      setForm((prev) => ({ ...prev, password: "" }));
      await refreshJwt();
      setSuccessMessage("Account details saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f5f3ff,_#f8fafc_55%,_#ffffff)] pt-24">
          <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-24">
            <div className="rounded-3xl border border-gray-200 bg-white/90 px-8 py-10 shadow-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading your account…</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef2ff,_#f8fafc_45%,_#ffffff)] pt-24">
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="mb-8 rounded-[32px] border border-slate-200 bg-slate-900 px-8 py-10 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                  <Settings2 className="h-3.5 w-3.5" />
                  Account
                </div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Manage your profile and preferences
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-300">
                  Update your personal details, keep your plan info in view, and
                  control optional DBT guidance from one place.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Signed in as
                </p>
                <p className="mt-1 text-lg font-medium">{profile?.email}</p>
              </div>
            </div>
          </div>

          {(error || successMessage) && (
            <div
              className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
                error
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {error || successMessage}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
            <form
              onSubmit={handleProfileSave}
              className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Personal details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Update the information shown across your account.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    First name
                  </span>
                  <input
                    value={form.first_name}
                    onChange={(e) =>
                      handleFieldChange("first_name", e.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Last name
                  </span>
                  <input
                    value={form.last_name}
                    onChange={(e) =>
                      handleFieldChange("last_name", e.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Middle name
                  </span>
                  <input
                    value={form.middle_name}
                    onChange={(e) =>
                      handleFieldChange("middle_name", e.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Phone number
                  </span>
                  <input
                    value={form.phone_number}
                    onChange={(e) =>
                      handleFieldChange("phone_number", e.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Date of birth
                  </span>
                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) =>
                      handleFieldChange("date_of_birth", e.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Gender
                  </span>
                  <input
                    value={form.gender}
                    onChange={(e) => handleFieldChange("gender", e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Preferred language
                  </span>
                  <input
                    value={form.preferred_language}
                    onChange={(e) =>
                      handleFieldChange("preferred_language", e.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  Diagnosis status
                </span>
                <input
                  value={form.diagnosis_status}
                  onChange={(e) =>
                    handleFieldChange("diagnosis_status", e.target.value)
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  New password
                </span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      handleFieldChange("password", e.target.value)
                    }
                    placeholder="Leave blank to keep your current password"
                    className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </label>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save changes
                </button>
              </div>
            </form>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Plan overview
                    </h2>
                    <p className="text-sm text-gray-500">
                      Your subscription status and billing level.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-950 p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Current plan
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-2xl font-semibold">
                    <span>{profile?.subscription_tier || "Free"}</span>
                    {profile?.subscription_tier &&
                      profile.subscription_tier !== "Free" && (
                        <BadgeCheck className="h-5 w-5 text-emerald-400" />
                      )}
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {profile?.subscription_tier === "Professional"
                      ? "Lifetime access"
                      : profile?.subscription_expires_at
                      ? `Renews or expires on ${new Date(
                          profile.subscription_expires_at
                        ).toLocaleDateString()}`
                      : "You are currently on the free plan."}
                  </p>
                  <button
                    type="button"
                    onClick={() => (window.location.href = "/pricing")}
                    className="mt-5 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                  >
                    Change plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
