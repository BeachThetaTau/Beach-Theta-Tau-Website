import { useNavigate } from "react-router-dom";
import { logout } from "@/modules/auth";
import { assetUrl } from "@/shared/lib/assets";
import { EmptyState } from "@/shared/ui/EmptyState/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState/LoadingState";
import { memberPhotoUrl } from "@/modules/members";
import { ProfileForm } from "../components/ProfileForm/ProfileForm";
import { ProfileView } from "../components/ProfileView/ProfileView";
import { DelibsProfileActions } from "../components/DelibsProfileActions/DelibsProfileActions";
import { useProfile } from "../hooks/useProfile";

export function ProfilePage() {
  const navigate = useNavigate();
  const profileState = useProfile();

  if (profileState.loading) return <LoadingState label="Loading your profile…" />;
  if (!profileState.profile) {
    return <EmptyState title="Profile unavailable" description={profileState.error ?? undefined} />;
  }

  const photoUrl =
    assetUrl(memberPhotoUrl(profileState.profile)) || assetUrl("Brothers/blankpfp.webp");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <section className="section">
      <div className="container-page grid items-start gap-10 md:grid-cols-[auto_minmax(0,1fr)] md:gap-14">
        <div className="flex flex-col items-center gap-4">
          <img
            className="aspect-[3/4] w-64 rounded-lg object-cover shadow-card"
            src={photoUrl}
            alt={`${profileState.profile.name || "Member"} profile`}
          />
          <DelibsProfileActions />
          <button
            type="button"
            className="w-full rounded-full border border-line bg-white px-5 py-2.5 text-base font-semibold text-ink transition-colors hover:bg-surface-soft"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>

        <div className="card w-full max-w-xl p-8">
          <p className="eyebrow">Your profile</p>
          <h1 className="section-title mt-2 mb-6">{profileState.profile.name || "Member"}</h1>
          {profileState.error && <p className="mb-4 text-sm text-red-600">{profileState.error}</p>}
          {profileState.editing && profileState.draft ? (
            <ProfileForm
              values={profileState.draft}
              errors={profileState.validationErrors}
              saving={profileState.saving}
              onChange={profileState.updateField}
              onSave={() => void profileState.save()}
              onCancel={profileState.cancelEditing}
            />
          ) : (
            <ProfileView
              profile={profileState.profile}
              onEdit={profileState.beginEditing}
              editIconUrl={assetUrl("edit.png")}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
