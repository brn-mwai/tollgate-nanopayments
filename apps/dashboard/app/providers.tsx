"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Tollgate brand palette — same tokens used in globals.css and the HTML
// preview. Every Clerk surface inherits these.
const BRAND = {
  pink: "#FF00AA",
  pinkBright: "#FF3CC0",
  pinkDark: "#B3007D",
  pinkDarkest: "#E60098",
  bgPage: "#0A0B10",
  bgCard: "#12131A",
  bgInput: "#101420",
  bgHover: "rgba(255,255,255,0.06)",
  text1: "#E8E9F0",
  text2: "#8A8CA0",
  text3: "#555770",
  border: "rgba(255,255,255,0.1)",
  borderSoft: "rgba(255,255,255,0.06)",
  red: "#C62828",
  green: "#06A77D",
};

const gradient = `linear-gradient(155deg, ${BRAND.pinkBright} 0%, ${BRAND.pink} 55%, ${BRAND.pinkDarkest} 100%)`;
const gradientHover = `linear-gradient(155deg, #FF55CC 0%, #FF1FB3 55%, #E800A0 100%)`;
const buttonShadow =
  "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 1px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.20)";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        layout: {
          logoImageUrl: "/logo.svg",
          logoPlacement: "inside",
          helpPageUrl: "https://tollgate.brianmwai.com/docs",
          privacyPageUrl: "https://tollgate.brianmwai.com/privacy",
          termsPageUrl: "https://tollgate.brianmwai.com/terms",
          shimmer: true,
          socialButtonsPlacement: "top",
          socialButtonsVariant: "blockButton",
        },
        variables: {
          colorPrimary: BRAND.pink,
          colorBackground: BRAND.bgCard,
          colorText: BRAND.text1,
          colorTextSecondary: BRAND.text2,
          colorTextOnPrimaryBackground: "#FFFFFF",
          colorInputBackground: BRAND.bgInput,
          colorInputText: BRAND.text1,
          colorNeutral: BRAND.text2,
          colorDanger: BRAND.red,
          colorSuccess: BRAND.green,
          colorShimmer: "rgba(255,255,255,0.04)",
          borderRadius: "8px",
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontFamilyButtons: '"DM Sans", system-ui, sans-serif',
          fontSize: "14px",
          fontWeight: { normal: "400", medium: "500", semibold: "600", bold: "700" },
          spacingUnit: "1rem",
        },
        elements: {
          // Root card — match our inset panel style
          rootBox: {
            width: "100%",
            maxWidth: "440px",
          },
          card: {
            background: BRAND.bgCard,
            border: `1px solid ${BRAND.border}`,
            borderRadius: "12px",
            boxShadow: "0 0 0 3px rgba(0,0,0,0.2), 0 20px 60px rgba(0,0,0,0.45)",
            padding: "32px",
          },
          cardBox: { boxShadow: "none" },
          // Header
          logoBox: {
            marginBottom: "18px",
            justifyContent: "center",
          },
          logoImage: { height: "36px", width: "auto" },
          headerTitle: {
            fontFamily: '"Instrument Serif", serif',
            fontSize: "28px",
            fontWeight: "400",
            letterSpacing: "-0.01em",
            color: BRAND.text1,
          },
          headerSubtitle: {
            fontSize: "13px",
            color: BRAND.text3,
            marginTop: "4px",
          },
          // Primary button — match Tollgate pink gradient pill system
          formButtonPrimary: {
            background: gradient,
            border: `1px solid ${BRAND.pinkDark}`,
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#FFFFFF",
            textShadow: "0 1px 0 rgba(0,0,0,0.2)",
            boxShadow: buttonShadow,
            transition: "background 0.15s ease, transform 0.05s ease",
            textTransform: "none" as const,
            letterSpacing: "0",
            "&:hover, &:focus": {
              background: gradientHover,
              boxShadow: buttonShadow,
            },
            "&:active": {
              transform: "translateY(1px)",
            },
          },
          // Secondary/ghost buttons
          formButtonReset: {
            color: BRAND.text2,
            "&:hover": { color: BRAND.text1 },
          },
          // Social buttons (Google, GitHub, etc.)
          socialButtons: {
            gap: "8px",
          },
          socialButtonsBlockButton: {
            background: BRAND.bgInput,
            border: `1px solid ${BRAND.border}`,
            borderRadius: "8px",
            color: BRAND.text1,
            fontSize: "13px",
            fontWeight: "500",
            padding: "10px 14px",
            "&:hover": {
              background: BRAND.bgHover,
              borderColor: BRAND.text3,
            },
          },
          socialButtonsBlockButtonText: {
            color: BRAND.text1,
            fontSize: "13px",
            fontWeight: "500",
          },
          // "or" divider
          dividerRow: { margin: "18px 0" },
          dividerLine: { background: BRAND.borderSoft },
          dividerText: {
            color: BRAND.text3,
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          },
          // Form labels + inputs
          formFieldLabel: {
            fontSize: "12px",
            fontWeight: "600",
            color: BRAND.text2,
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          },
          formFieldInput: {
            background: BRAND.bgInput,
            border: `1px solid ${BRAND.border}`,
            borderRadius: "8px",
            color: BRAND.text1,
            fontSize: "14px",
            padding: "10px 12px",
            "&:focus": {
              borderColor: BRAND.pink,
              boxShadow: `0 0 0 3px rgba(255,0,170,0.12)`,
            },
          },
          formFieldInputShowPasswordButton: { color: BRAND.text3 },
          // Footer ("Don't have an account? Sign up")
          footer: {
            background: "transparent",
            borderTop: `1px solid ${BRAND.borderSoft}`,
            padding: "14px 0 0",
            marginTop: "18px",
          },
          footerAction: {
            color: BRAND.text2,
            fontSize: "13px",
          },
          footerActionLink: {
            color: BRAND.pinkBright,
            fontWeight: "600",
            textDecoration: "none",
            "&:hover": { color: BRAND.pink },
          },
          footerPages: { justifyContent: "center", marginTop: "8px" },
          footerPagesLink: { color: BRAND.text3, fontSize: "11px" },
          // Identity preview (when email already filled)
          identityPreview: {
            background: BRAND.bgInput,
            border: `1px solid ${BRAND.border}`,
            borderRadius: "8px",
          },
          identityPreviewText: { color: BRAND.text1 },
          identityPreviewEditButton: { color: BRAND.pinkBright },
          // OTP code input
          otpCodeFieldInput: {
            background: BRAND.bgInput,
            border: `1px solid ${BRAND.border}`,
            color: BRAND.text1,
            "&:focus": {
              borderColor: BRAND.pink,
              boxShadow: `0 0 0 3px rgba(255,0,170,0.12)`,
            },
          },
          // Alerts + field errors
          alert: {
            background: "rgba(198,40,40,0.08)",
            border: `1px solid rgba(198,40,40,0.35)`,
            borderRadius: "8px",
            color: BRAND.red,
          },
          formFieldErrorText: { color: BRAND.red, fontSize: "12px" },
          // Modal overlay
          modalBackdrop: {
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
          },
          modalContent: {
            background: "transparent",
          },
          // UserButton popover
          userButtonPopoverCard: {
            background: BRAND.bgCard,
            border: `1px solid ${BRAND.border}`,
            borderRadius: "10px",
          },
          userButtonPopoverActionButton: {
            color: BRAND.text2,
            "&:hover": { background: BRAND.bgHover, color: BRAND.text1 },
          },
          userButtonPopoverFooter: { background: "transparent" },
          userPreviewMainIdentifier: { color: BRAND.text1 },
          userPreviewSecondaryIdentifier: { color: BRAND.text3 },
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
