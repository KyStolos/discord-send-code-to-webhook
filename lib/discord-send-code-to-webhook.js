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

  discordCharLimit: 2000,

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
    let editor;
    if(editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText();
      if(selection && selection != "") {
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
          let contentPart1 = "*Language:* `"+grammar+"` ```"+grammar+"\n";
          let contentPart2 = "```";
          let content = contentPart1+selection+contentPart2;

          if(content.length > this.discordCharLimit) { //If content has more chars than discord char limit
            let sendFunction = this.send;
            let discordCharLimit = this.discordCharLimit;
            let charLimit = this.discordCharLimit-(contentPart1.length+contentPart2.length);

            notification = atom.notifications.addWarning(
              "Your selection has more characters than discord's max limit ("+discordCharLimit+" chars)!", {
              dismissable: true,
              buttons: [
                {
                  onDidClick: function() {
                    sendFunction(contentPart1+selection.substring(0, charLimit)+contentPart2, grammar, webhookURL),
                    notification.dismiss()
                  },
                  text: "Send only the first "+discordCharLimit+" chars"
                },
                {
                  onDidClick: function() {
                    notification.dismiss()
                  },
                  text: "Close"
                }
              ]
            });
          } else { //Selection is not too long
            this.send(content, grammar, webhookURL);
          }
        } else {
          atom.notifications.addError("You must set your Discord webhook URL in the package config!")
        }
      } else {
        atom.notifications.addWarning("Your selection is empty!");
      }
    }
  },

  send(content, grammar, webhookURL) {
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
      "content": content
    });
    xhr.send(data);
  }
};
