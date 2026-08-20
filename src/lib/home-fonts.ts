import { IBM_Plex_Mono, Instrument_Serif, Noto_Sans_SC, Noto_Serif_SC, Outfit } from "next/font/google";

export const homeSans = Outfit({
  subsets: ["latin"],
  variable: "--font-home-sans",
  display: "swap",
});

export const homeSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-home-serif",
  display: "swap",
});

export const homeMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-home-mono",
  display: "swap",
});

export const homeSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-home-sans-sc",
  display: "swap",
  preload: false,
});

export const homeSerifSc = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-home-serif-sc",
  display: "swap",
  preload: false,
});

export const homeFontClass = [
  homeSans.variable,
  homeSerif.variable,
  homeMono.variable,
  homeSansSc.variable,
  homeSerifSc.variable,
].join(" ");
