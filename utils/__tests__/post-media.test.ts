import assert from "node:assert/strict";
import test from "node:test";

import { isVideoPostMedia } from "../post-media.ts";

test("treats mediaType video as post video", () => {
  assert.equal(
    isVideoPostMedia({
      mediaType: "video",
      mediaUrl: "https://cdn.example.com/post-image.jpg",
    }),
    true
  );
});

test("treats common video file extensions as post video", () => {
  assert.equal(
    isVideoPostMedia({
      mediaType: "image",
      mediaUrl: "https://cdn.example.com/clip.mp4?token=abc",
    }),
    true
  );
});

test("does not treat image media as video", () => {
  assert.equal(
    isVideoPostMedia({
      mediaType: "image",
      mediaUrl: "https://cdn.example.com/photo.jpg",
    }),
    false
  );
});
