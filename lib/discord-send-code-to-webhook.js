'use babel';

import DiscordSendCodeToWebhookView from './discord-send-code-to-webhook-view';
import { CompositeDisposable } from 'atom';

export default {
  config: {
    "webhook-url": {
      "description": "The default webhook to which the code selection will be sent.",
      "type": "string",
      "default": ""
    },
    "webhook-url-2": {
      "description": "A second webhook URL, if you want to be able to send code to multiple channels.",
      "type": "string",
      "default": ""
    },
    "webhook-url-3": {
      "description": "A third webhook URL.",
      "type": "string",
      "default": ""
    }
  },

  discordSendCodeToWebhookView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.discordSendCodeToWebhookView = new DiscordSendCodeToWebhookView(state.discordSendCodeToWebhookViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.discordSendCodeToWebhookView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'discord-send-code-to-webhook:toggle': () => this.toggle()
    }));

    //Register send code to discord command
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'discord-send-code-to-webhook:sendSelectionToDiscord': () => this.sendSelectionToDiscord(1)
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'discord-send-code-to-webhook:sendSelectionToDiscord2': () => this.sendSelectionToDiscord(2)
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'discord-send-code-to-webhook:sendSelectionToDiscord3': () => this.sendSelectionToDiscord(3)
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.discordSendCodeToWebhookView.destroy();
  },

  serialize() {
    return {
      discordSendCodeToWebhookViewState: this.discordSendCodeToWebhookView.serialize()
    };
  },

  toggle() {
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

  sendSelectionToDiscord(webhookConfigToUse) {
    console.log("ok");
    let editor;
    if(editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText();
      let grammar = editor.getGrammar().name;
      let webhookURL = atom.config.get('discord-send-code-to-webhook.webhook-url'); //Default config
      if(webhookConfigToUse) {
        switch (webhookConfigToUse) {
          case 1:
            webhookURL = atom.config.get('discord-send-code-to-webhook.webhook-url');
            break;
          case 2:
            webhookURL = atom.config.get('discord-send-code-to-webhook.webhook-url-2');
            break;
          case 3:
            webhookURL = atom.config.get('discord-send-code-to-webhook.webhook-url-3');
            break;
        }
      }

      if(webhookURL) { //The user has set his webhook url in the configs
        xhr = new XMLHttpRequest();
        xhr.open("POST", webhookURL, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function() {
          if(xhr.readyState === 4) {
            if(Math.round((xhr.status)/100) === 2) {
              atom.notifications.addSuccess("Success: your code has been sent to Discord!")
            } else {
              atom.notifications.addError("Error "+xhr.status+" "+xhr.statusText+": please check the URL you provided in the package's config");
            }
          }
        };

        let data = JSON.stringify({
          "content": "*Language:* `"+grammar+"` ```"+grammar+"\n"+selection+"```"
        });
        xhr.send(data);
      } else {
        atom.notifications.addError("You must set your Discord webhook URL in the package config!")
      }
    }
  }
};
