import { describe, it, expect } from "vitest";
import { normalizeTrack } from "./spotify";

describe("normalizeTrack", () => {
  it("maps a Spotify track item and joins artists", () => {
    const item = {
      name: "Kabira",
      artists: [{ name: "Tochi Raina" }, { name: "Rekha Bhardwaj" }],
      album: {
        name: "Yeh Jawaani Hai Deewani",
        images: [{ url: "https://i.scdn.co/big.jpg" }, { url: "https://i.scdn.co/small.jpg" }],
      },
      external_urls: { spotify: "https://open.spotify.com/track/x" },
    };
    expect(normalizeTrack(item, true)).toEqual({
      title: "Kabira",
      artist: "Tochi Raina, Rekha Bhardwaj",
      album: "Yeh Jawaani Hai Deewani",
      url: "https://open.spotify.com/track/x",
      image: "https://i.scdn.co/small.jpg",
      isPlaying: true,
    });
  });

  it("returns null when the item is missing", () => {
    expect(normalizeTrack(undefined, false)).toBeNull();
    expect(normalizeTrack({}, false)).toBeNull();
  });
});
