import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  aws_project_region: import.meta.env.VITE_AWS_REGION,
  aws_cognito_region: import.meta.env.VITE_AWS_REGION,
  aws_user_pools_id: import.meta.env.VITE_AWS_USER_POOL_ID,
  aws_user_pools_web_client_id: import.meta.env.VITE_AWS_CLIENT_ID,
  aws_mandatory_sign_in: 'enable',
  aws_cloud_logic_custom: [
    {
      name: 'api',
      endpoint: import.meta.env.VITE_API_ENDPOINT,
      region: import.meta.env.VITE_AWS_REGION
    }
  ]
};

Amplify.configure(amplifyConfig);

export default amplifyConfig; 