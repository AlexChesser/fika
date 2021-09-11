export interface ICommand {
  token?: String | null; // gIkuvaNzQIHg97ATvDxqgjtO
  team_id: String; // T0001
  team_domain: String; // example
  enterprise_id: String; // E0001
  enterprise_name: String; // Globular%20Construct%20Inc
  channel_id: String; // C2147483705
  channel_name: String; // test
  user_id: String; // U2147483697
  user_name: String; // Steve
  command: String; // /weather
  text: String; // 94070
  response_url?: String; // https://hooks.slack.com/commands/1234/5678
  trigger_id?: String; // 13345224609.738474920.8088930838d88f008e0
  api_app_id?: String; // A12345
  frequency?: number;
  lastMatch?: Date;
}
