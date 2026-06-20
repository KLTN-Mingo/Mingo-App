import assert from "node:assert/strict";
import test from "node:test";

import {
  getPostMediaDetailHeight,
  getPostMediaPreviewHeight,
  isVideoPostMedia,
  normalizePostMedia,
} from "../post-media.ts";

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

test("normalizes API video type and file URL variants", () => {
  assert.deepEqual(
    normalizePostMedia({
      id: "media-1",
      type: "VIDEO",
      fileUrl: "https://cdn.example.com/video-stream",
    }),
    {
      id: "media-1",
      mediaType: "video",
      mediaUrl: "https://cdn.example.com/video-stream",
      orderIndex: 0,
    }
  );
});

test("uses a fixed list preview height for every media shape", () => {
  assert.equal(
    getPostMediaPreviewHeight({ width: 320, height: 180 }),
    320
  );
  assert.equal(
    getPostMediaPreviewHeight({ width: 1080, height: 1920 }),
    320
  );
});

test("uses original media dimensions in the post detail view", () => {
  assert.equal(
    getPostMediaDetailHeight(328, { width: 1200, height: 800 }),
    219
  );
  assert.equal(
    getPostMediaDetailHeight(328, { width: 800, height: 1200 }),
    460
  );
});
