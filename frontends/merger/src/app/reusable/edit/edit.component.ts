import { Component, Input, ViewChild } from '@angular/core';
import { ArtistResponseFull } from '../../../openapi';
import { ArtistPaneComponent } from './artist-pane/artist-pane.component';
import { ConfigPaneComponent } from './config-pane/config-pane.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.less'],
})
export class EditComponent {
  @Input() artists: ArtistResponseFull[] = []; // only at beginning
  @ViewChild(ArtistPaneComponent) table!: ArtistPaneComponent;
  @ViewChild(ConfigPaneComponent) config!: ConfigPaneComponent;

  searchArtist = '';
  searchLoading = false;

  constructor(private api: ApiService) {}

  /**
   * Gets triggered when artists change in artist table.
   * @param artists The new list of artists.
   */
  onArtistChange(artists: ArtistResponseFull[]) {
    this.config.setArtists(artists);
  }

  /**
   * Returns artists from artist table.
   */
  async getArtistData(): Promise<ArtistResponseFull[]> {
    return this.config.getArtists();
  }

  /**
   * Searches for an artist and adds the artist to artist data if found.
   */
  async onSearchArtist() {
    // skip requests if the last one is still loading
    if (this.searchLoading || !this.searchArtist) return;

    this.searchLoading = true;
    try {
      const res = await this.api.searchArtist(this.searchArtist);

      if (!res.artist) {
        // ... handle no valid artist found
      } else if (this.table.checkForArtist(res.artist)) {
        // ... handle artist already there
      } else {
        this.table.addArtistToTable(res.artist);

        // reset the input field
        this.searchArtist = '';
      }
    } catch (e) {
      // ... handle failed artist search
    }
    this.searchLoading = false;
  }
}
