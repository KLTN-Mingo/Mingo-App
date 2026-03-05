import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    TouchableOpacity,
    View,
} from 'react-native';

import { Avatar, Icon, Text } from '@/components/ui';
import { PostResponseDto } from '@/dtos';
import { postService } from '@/services/post.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PostCardProps {
  post: PostResponseDto;
  onLikeChange?: (postId: string, isLiked: boolean) => void;
  onCommentPress?: (postId: string) => void;
  onUserPress?: (userId: string) => void;
  onMorePress?: (post: PostResponseDto) => void;
}

export function PostCard({
  post,
  onLikeChange,
  onCommentPress,
  onUserPress,
  onMorePress,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async () => {
    if (likeLoading) return;

    setLikeLoading(true);
    const newIsLiked = !isLiked;

    // Optimistic update
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      if (newIsLiked) {
        await postService.likePost(post.id);
      } else {
        await postService.unlikePost(post.id);
      }
      onLikeChange?.(post.id, newIsLiked);
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
      console.error('Like error:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return '';
    }
  };

  const renderMentions = () => {
    if (!post.mentions || post.mentions.length === 0) return null;

    const mentionNames = post.mentions.map((m) => m.name).filter(Boolean);
    if (mentionNames.length === 0) return null;

    if (mentionNames.length === 1) {
      return (
        <Text className="text-text-muted-light dark:text-text-muted-dark">
          {' '}with <Text className="font-semibold text-text-light dark:text-text-dark">{mentionNames[0]}</Text>
        </Text>
      );
    }

    return (
      <Text className="text-text-muted-light dark:text-text-muted-dark">
        {' '}with{' '}
        <Text className="font-semibold text-text-light dark:text-text-dark">
          {mentionNames[0]}
        </Text>{' '}
        and {mentionNames.length - 1} others
      </Text>
    );
  };

  return (
    <View className="bg-background-light dark:bg-background-dark mb-2">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => onUserPress?.(post.userId)}
          className="flex-row items-center flex-1"
        >
          <Avatar
            source={post.user?.avatar ? { uri: post.user.avatar } : undefined}
            fallback={post.user?.name}
            size="md"
          />
          <View className="ml-3 flex-1">
            <View className="flex-row flex-wrap items-center">
              <Text className="font-semibold">{post.user?.name || 'Unknown'}</Text>
              {renderMentions()}
            </View>
            <Text variant="muted" className="text-xs">
              {formatTime(post.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onMorePress?.(post)} className="p-2">
          <Icon name="ellipsis" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {post.contentText && (
        <View className="px-4 pb-2">
          <Text>{post.contentText}</Text>
        </View>
      )}

      {/* Location & Music Tags */}
      {(post.location?.name || post.hashtags?.length) && (
        <View className="flex-row flex-wrap items-center px-4 pb-2 gap-2">
          {post.location?.name && (
            <View className="flex-row items-center">
              <Icon name="location" size={14} color="#768D85" />
              <Text variant="muted" className="text-xs ml-1">
                {post.location.name}
              </Text>
            </View>
          )}
          {post.hashtags?.slice(0, 2).map((tag, index) => (
            <View key={index} className="flex-row items-center">
              <Text variant="muted" className="text-xs">—</Text>
              <Icon name="music.note" size={14} color="#768D85" className="ml-1" />
              <Text variant="muted" className="text-xs ml-1">
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <View className="mt-1">
          {post.media.length === 1 ? (
            <Image
              source={{ uri: post.media[0].mediaUrl }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-row flex-wrap">
              {post.media.slice(0, 4).map((media, index) => (
                <Image
                  key={media.id}
                  source={{ uri: media.mediaUrl }}
                  style={{
                    width: SCREEN_WIDTH / 2,
                    height: SCREEN_WIDTH / 2,
                  }}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row items-center px-4 py-3 gap-4">
        {/* Like */}
        <TouchableOpacity
          onPress={handleLike}
          className="flex-row items-center"
          disabled={likeLoading}
        >
          <Icon
            name={isLiked ? 'heart.fill' : 'heart'}
            size={22}
            color={isLiked ? '#EF4444' : '#9CA3AF'}
          />
          {likesCount > 0 && (
            <Text variant="muted" className="ml-1">
              {likesCount} likes
            </Text>
          )}
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          onPress={() => onCommentPress?.(post.id)}
          className="flex-row items-center"
        >
          <Icon name="bubble.left" size={22} color="#9CA3AF" />
          {post.commentsCount > 0 && (
            <Text variant="muted" className="ml-1">
              {post.commentsCount} comments
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Comment Input */}
      <View className="flex-row items-center px-4 pb-3 gap-2">
        <Avatar size="sm" />
        <TouchableOpacity
          onPress={() => onCommentPress?.(post.id)}
          className="flex-1 bg-surface-light dark:bg-surface-dark rounded-full px-4 py-2"
        >
          <Text variant="muted">Write comment...</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}