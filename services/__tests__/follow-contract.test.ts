import assert from "node:assert/strict";
import test from "node:test";

import {
  CloseFriendStatus,
  FollowStatus,
  RelationshipType,
} from "../../dtos/follow.dto";

import {
  buildFollowCollectionPath,
  getFollowActionState,
  normalizeRelationshipStatus,
} from "../follow-contract";

test("pending or rejected follow statuses are not treated as accepted relationship booleans", () => {
  const pending = normalizeRelationshipStatus({
    followStatus: FollowStatus.PENDING,
    followerStatus: FollowStatus.REJECTED,
    closeFriendStatus: CloseFriendStatus.PENDING,
  });

  assert.equal(pending.isFollowing, false);
  assert.equal(pending.isFollower, false);
  assert.equal(pending.isFriend, false);
  assert.equal(pending.isCloseFriend, false);
  assert.equal(pending.relationshipType, RelationshipType.NONE);
});

test("mutual accepted follow becomes friend and close friend requires explicit accepted close-friend state", () => {
  const friend = normalizeRelationshipStatus({
    isFollowing: true,
    isFollower: true,
    followStatus: FollowStatus.ACCEPTED,
    followerStatus: FollowStatus.ACCEPTED,
    closeFriendStatus: CloseFriendStatus.PENDING,
    isCloseFriend: true,
  });

  assert.equal(friend.isFriend, true);
  assert.equal(friend.isCloseFriend, false);
  assert.equal(friend.relationshipType, RelationshipType.FRIEND);

  const closeFriend = normalizeRelationshipStatus({
    isFollowing: true,
    isFollower: true,
    followStatus: FollowStatus.ACCEPTED,
    followerStatus: FollowStatus.ACCEPTED,
    closeFriendStatus: CloseFriendStatus.ACCEPTED,
    isCloseFriend: true,
  });

  assert.equal(closeFriend.isFriend, true);
  assert.equal(closeFriend.isCloseFriend, true);
  assert.equal(closeFriend.relationshipType, RelationshipType.CLOSE_FRIEND);
});

test("follow action state matches backend contract labels and actions", () => {
  assert.deepEqual(getFollowActionState(null), {
    action: "follow",
    label: "Follow",
  });

  assert.deepEqual(
    getFollowActionState(
      normalizeRelationshipStatus({ followStatus: FollowStatus.PENDING })
    ),
    {
      action: "cancel_request",
      label: "Request sent",
    }
  );

  assert.deepEqual(
    getFollowActionState(
      normalizeRelationshipStatus({
        followStatus: FollowStatus.ACCEPTED,
        isFollowing: true,
      })
    ),
    {
      action: "unfollow",
      label: "Following",
    }
  );

  assert.deepEqual(
    getFollowActionState(
      normalizeRelationshipStatus({ followStatus: FollowStatus.REJECTED })
    ),
    {
      action: "follow",
      label: "Follow",
    }
  );
});

test("close-friends path never uses another user id and foreign follow lists never request pending or rejected", () => {
  assert.equal(buildFollowCollectionPath("close-friends", { page: 2, limit: 15 }), "/close-friends?page=2&limit=15");
  assert.equal(
    buildFollowCollectionPath("followers", {
      userId: "u-1",
      page: 1,
      limit: 20,
      status: FollowStatus.PENDING,
    }),
    "/u-1/followers?page=1&limit=20"
  );
  assert.equal(
    buildFollowCollectionPath("following", {
      userId: "u-2",
      page: 3,
      limit: 10,
      status: FollowStatus.ACCEPTED,
    }),
    "/u-2/following?page=3&limit=10&status=accepted"
  );
});
