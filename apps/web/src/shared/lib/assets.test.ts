import { describe, it, expect } from "vitest";
import { assetUrl } from "./assets";

describe("verify all static assets referenced in codebase", () => {
  const referencedAssets = [
    // Brand
    "Hammer-and-tongs.png",

    // Home
    "WhoAreWe.jpg",
    "FillerPic.jpg",
    "Scenery.jpg",

    // About
    "About.jpg",
    "TTFounders.jpg",
    "Founders.jpg",

    // Social
    "Social.jpg",
    "Retreat.jpg",
    "Regionals.jpg",
    "IMSports.jpg",
    "Instigators.jpg",
    "RoyalTigers.jpg",
    "Candela.jpg",
    "B2.jpg",
    "Traitors.jpg",

    // Service
    "Service.jpg",
    "Food.jpg",
    "Prepping.jpg",
    "Cooking.jpg",
    "Volunteering.jpg",
    "Donation.jpg",
    "Conservation.jpg",
    "BeachCleanUp.jpg",
    "MesaDay.jpg",
    "SoupKitchen.jpg",

    // Professionalism
    "Professionalism.jpg",
    "CarineGordilloIntern.jpg",
    "MiaCastroIntern.jpg",
    "Divergent.png",
    "NorthropGrumman.png",
    "Boeing.png",
    "Benchmark.png",
    "SpaceX.png",
    "Microsoft.png",
    "Tesla.png",
    "J&J.png",
    "NASA.png",
    "Belkin.png",
    "Google.png",
    "Meta.png",
    "Raytheon.png",
    "Kaiser.png",
    "Amazon.png",
    "SCE.png",
  ];

  for (const asset of referencedAssets) {
    it(`should resolve ${asset}`, () => {
      const url = assetUrl(asset);
      expect(url, `Asset not found: ${asset}`).not.toBe("");
    });
  }
});
