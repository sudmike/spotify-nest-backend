import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IFirebaseService } from '../../services/external/IFirebase.service';

@Injectable()
export class DatabaseService extends IFirebaseService {
  constructor() {
    super();
    import(`../${process.env.FIREBASE_CREDENTIALS_MERGER}.json`).then((res) => {
      super.initialize(res);
    });
  }

  /**
   * Add a user to the merger database.
   * @param id A UUID that identifies the user.
   */
  async addUser(id: string): Promise<string> {
    try {
      await super.updateEntry('users', id, {});
      return id;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Update refresh token for Spotify.
   * @param id A UUID that identifies the user.
   * @param spotifyRefresh The refresh token.
   */
  async updateSpotifyToken(
    id: string,
    spotifyRefresh: string,
  ): Promise<string> {
    try {
      await super.updateEntry('users', id, { spotifyRefresh });
      return id;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Gets the entry for a user.
   * @param id A UUID that identifies the user.
   */
  async getUserData(id: string): Promise<UserData> {
    try {
      const data = await super.getEntry('users', id);
      return { refreshToken: data.spotifyRefresh, id };
    } catch (e) {
      throw e;
    }
  }

  /**
   * Adds information about a generated playlist.
   * @param id The playlists ID.
   * @param user A UUID that identifies the user.
   * @param artists The IDs of artists that are part of the playlist.
   */
  async addUserPlaylist(
    id: string,
    user: string,
    artists: string[],
  ): Promise<void> {
    try {
      // create playlist entry
      await super.addEntry('playlists', id, {
        user,
        artists,
      });

      // modify user entry
      await super.addEntryField('users', user, 'active-playlists', id, true);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * Gets the playlist IDs of a user.
   * @param id A UUID that identifies the user.
   */
  async getUserPlaylists(id: string): Promise<PlaylistData[]> {
    try {
      const resA = await super.getEntryField('users', id, 'active-playlists');
      const resI = await super.getEntryField('users', id, 'inactive-playlists');

      // map responses to arrays of playlist ids
      const activeIds = resA ? Object.keys(resA) : [];
      const inactiveIds = resI ? Object.keys(resI) : [];

      const playlists: PlaylistData[] = [];
      for await (const playlistId of activeIds)
        playlists.push({
          id: playlistId,
          artists: await this.getPlaylistArtists(playlistId, id),
          active: true,
        });

      for await (const playlistId of inactiveIds)
        playlists.push({
          id: playlistId,
          artists: await this.getPlaylistArtists(playlistId, id),
          active: false,
        });

      return playlists;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * Changes a playlist to active or inactive.
   * @param id A UUID that identifies the user.
   * @param playlist The ID of the playlist.
   * @param active Defines if the playlist should be set to active or to inactive.
   */
  async setPlaylistActiveness(id: string, playlist: string, active: boolean) {
    try {
      // ... check playlist (active, inactive, does not exist)
      // ... add to XYZ
      // ... remove from XYZ
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * Return an array of artist IDs.
   * @param id The ID of the playlist.
   * @param user A UUID that identifies the user.
   */
  private async getPlaylistArtists(
    id: string,
    user: string,
  ): Promise<PlaylistArtistsData> {
    const res = await super.getEntry('playlists', id);

    if (res.user === user) {
      return res.artists;
    } else {
      throw new UnauthorizedException(
        undefined,
        'Requested playlist does not belong to user',
      );
    }
  }
}

export type UserData = {
  id: string;
  refreshToken: string;
};

export type PlaylistArtistsData = string[];
type PlaylistDataRes = { id: string; artists: PlaylistArtistsData };
export type PlaylistData = PlaylistDataRes & { active: boolean };
