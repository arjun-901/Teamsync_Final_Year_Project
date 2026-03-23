import { StreamClient } from "@stream-io/node-sdk";
import { config } from "../config/app.config";
import { BadRequestException } from "../utils/appError";

let streamClient: StreamClient | null = null;

const assertStreamConfig = () => {
  if (!config.STREAM_API_KEY || !config.STREAM_API_SECRET) {
    throw new BadRequestException(
      "Stream Video is not configured. Please add STREAM_API_KEY and STREAM_API_SECRET."
    );
  }
};

export const getStreamVideoClient = () => {
  assertStreamConfig();

  if (!streamClient) {
    streamClient = new StreamClient(
      config.STREAM_API_KEY,
      config.STREAM_API_SECRET,
      {
        timeout: config.STREAM_TIMEOUT,
      }
    );
  }

  return streamClient;
};

export const getStreamCallType = () => config.STREAM_CALL_TYPE || "default";

export const buildStreamUser = (user: any) => ({
  id: user._id.toString(),
  name: user.name || user.email || "TeamSync User",
  image: user.profilePicture || undefined,
});

export const generateStreamUserToken = (userId: string) => {
  const client = getStreamVideoClient();
  return client.generateUserToken({
    user_id: userId,
    validity_in_seconds: 60 * 60 * 12,
  });
};
