import { AIVideo } from '../types';

export class AIVideoService {
  private static tokenKey = 'auth_token';

  private static getHeaders(): HeadersInit {
    const token = localStorage.getItem(this.tokenKey);
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Generates a new AI lecture explainer video for a course in a specified language.
   * Generates an interactive slide presentation with spoken text, detailed topics,
   * real-time examples, GUI diagrams, and advanced concepts.
   */
  public static async generateVideo(courseId: string, language: string = 'English'): Promise<AIVideo> {
    const response = await fetch('/api/video/generate', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ courseId, language })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to generate AI Video Explainer. Please check connection and quota.');
    }

    return response.json();
  }

  /**
   * Retrieves all previously generated video sessions for a specific course.
   */
  public static async getVideos(courseId: string): Promise<AIVideo[]> {
    const response = await fetch(`/api/video/course/${courseId}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve previously generated video sessions.');
    }

    return response.json();
  }
}
