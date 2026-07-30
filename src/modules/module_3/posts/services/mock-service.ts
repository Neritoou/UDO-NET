import { PostService, ActionResponse } from './types';
import { MockPost, mockPosts } from './mock-data';
import { createPostAction } from '@module_3/posts/actions/post';
import { getThread } from '@module_3/posts/actions/thread';
import { searchPosts } from '@module_3/search/actions/search';

export class MockPostService implements PostService {
  private static instance: MockPostService | null = null;

  private constructor() {}

  public static getInstance(): MockPostService {
    if (!this.instance) {
      this.instance = new MockPostService();
    }
    return this.instance;
  }

  async getThread(id: string): Promise<MockPost | null> {
    return getThread(id);
  }

  async createPost(formData: FormData): Promise<ActionResponse> {
    return createPostAction(formData);
  }

  async search(term: string, community?: string, tags?: string[], filter?: string): Promise<MockPost[]> {
    return searchPosts(term, community, tags, filter);
  }

  async getPosts(filter: string = 'recientes'): Promise<MockPost[]> {
    const sorted = [...mockPosts];
    sorted.sort((a, b) => {
      if (filter === 'votados') {
        return (b.votes || 0) - (a.votes || 0);
      } else if (filter === 'respuestas') {
        return (b.repliesCount || 0) - (a.repliesCount || 0);
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return sorted;
  }
}
