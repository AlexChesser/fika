import { OauthV2AccessResponse } from "@slack/web-api"
export interface IOAuthToken {
    team_id: string;
    access_token: string;
    response: OauthV2AccessResponse;
}