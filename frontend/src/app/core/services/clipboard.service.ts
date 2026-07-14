import { Clipboard } from '@angular/cdk/clipboard';
import { Injectable, inject } from '@angular/core';

/**
 * Copy-to-clipboard behind a one-method interface.
 *
 * Wrapping the CDK here means components don't care *how* copying works, and the
 * behaviour is trivially fakeable in tests.
 */
@Injectable({ providedIn: 'root' })
export class ClipboardService {
  private readonly clipboard = inject(Clipboard);

  /** Copies `text`, returning whether the copy succeeded. */
  copy(text: string): boolean {
    return this.clipboard.copy(text);
  }
}
