export type PreSignUpEvent = {
  response: {
    autoConfirmUser?: boolean;
    autoVerifyEmail?: boolean;
    autoVerifyPhone?: boolean;
  };
};

/** Local Floci does not deliver Cognito mail. Confirm the user on sign-up. */
export async function handler(event: PreSignUpEvent) {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  return event;
}
