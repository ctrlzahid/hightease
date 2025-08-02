export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'external';
  id?: string;
  url: string;
  thumbnail?: string;
  embedUrl?: string;
}

export const parseVideoUrl = (url: string): VideoInfo | null => {
  const trimmedUrl = url.trim();

  // YouTube patterns
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = trimmedUrl.match(youtubeRegex);

  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      type: 'youtube',
      id: videoId,
      url: trimmedUrl,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
    };
  }

  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = trimmedUrl.match(vimeoRegex);

  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      id: videoId,
      url: trimmedUrl,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
    };
  }

  // For any other URL, treat as external
  if (trimmedUrl.startsWith('http')) {
    return {
      type: 'external',
      url: trimmedUrl,
    };
  }

  return null;
};

export const getVideoThumbnail = async (
  videoInfo: VideoInfo
): Promise<string | undefined> => {
  if (videoInfo.type === 'youtube') {
    return videoInfo.thumbnail;
  }

  if (videoInfo.type === 'vimeo' && videoInfo.id) {
    try {
      const response = await fetch(
        `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoInfo.id}`
      );
      const data = await response.json();
      return data.thumbnail_url;
    } catch (error) {
      console.error('Error fetching Vimeo thumbnail:', error);
      return undefined;
    }
  }

  return undefined;
};

export const isVideoUrl = (url: string): boolean => {
  return parseVideoUrl(url) !== null;
};

export const getEmbedUrl = (videoInfo: VideoInfo): string => {
  return videoInfo.embedUrl || videoInfo.url;
};
