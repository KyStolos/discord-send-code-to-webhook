'use babel';

import DiscordSendCodeToWebhook from '../lib/discord-send-code-to-webhook';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('DiscordSendCodeToWebhook', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('discord-send-code-to-webhook');
  });

  describe('when the discord-send-code-to-webhook:toggle event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.discord-send-code-to-webhook')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'discord-send-code-to-webhook:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.discord-send-code-to-webhook')).toExist();

        let discordSendCodeToWebhookElement = workspaceElement.querySelector('.discord-send-code-to-webhook');
        expect(discordSendCodeToWebhookElement).toExist();

        let discordSendCodeToWebhookPanel = atom.workspace.panelForItem(discordSendCodeToWebhookElement);
        expect(discordSendCodeToWebhookPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'discord-send-code-to-webhook:toggle');
        expect(discordSendCodeToWebhookPanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.discord-send-code-to-webhook')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'discord-send-code-to-webhook:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let discordSendCodeToWebhookElement = workspaceElement.querySelector('.discord-send-code-to-webhook');
        expect(discordSendCodeToWebhookElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'discord-send-code-to-webhook:toggle');
        expect(discordSendCodeToWebhookElement).not.toBeVisible();
      });
    });
  });
});
