/**
 * Portal Forgot Password Page
 *
 * Allows portal users to request a password reset link.
 */

import { useState } from "react";
import { portalPath } from "@/lib/portalBasePath";
import { Link } from "wouter";
import { portalTrpc } from "@/lib/portalTrpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Mail, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/contexts/i18n";
export default function PortalForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const forgotPasswordMutation = portalTrpc.auth.forgotPassword.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      // DEV: capture the reset URL for testing
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    forgotPasswordMutation.mutate({
      email: email.trim(),
      origin: window.location.origin,
    });
  };

  const copyResetLink = () => {
    if (resetUrl) {
      navigator.clipboard.writeText(resetUrl);
      toast.success(t("portal_forgot_password.toast.copy_success"));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl">{t("portal_forgot_password.submitted.title")}</CardTitle>
            <CardDescription>
              {t("portal_forgot_password.submitted.description").replace("{email}", email)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {t("portal_forgot_password.submitted.instructions")}
            </p>

            {/* DEV ONLY: Show reset link for testing */}
            {resetUrl && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">
                  {t("portal_forgot_password.submitted.dev_mode_notice")}
                </p>
                <div className="flex gap-2">
                  <Input
                    value={resetUrl}
                    readOnly
                    className="text-xs font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyResetLink}
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(resetUrl, "_blank")}
                    className="shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setResetUrl(null);
                }}
                className="w-full"
              >
                {t("portal_forgot_password.button.try_different_email")}
              </Button>
              <Link href={portalPath("/login")}>
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("portal_forgot_password.button.back_to_login")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{t("portal_forgot_password.title")}</CardTitle>
          <CardDescription>
            {t("portal_forgot_password.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("portal_forgot_password.form.email_label")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("portal_forgot_password.form.email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={forgotPasswordMutation.isPending || !email.trim()}
            >
              {forgotPasswordMutation.isPending ? t("portal_forgot_password.button.sending") : t("portal_forgot_password.button.send_reset_link")}
            </Button>

            <Link href={portalPath("/login")}>
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("portal_forgot_password.button.back_to_login")}
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
