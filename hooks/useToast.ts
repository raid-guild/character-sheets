import { useToast as useChakraToast } from '@chakra-ui/react';

import { getErrorMessage, USER_ERRORS } from '@/utils/errors';

export const useToast = (): {
  renderError: (error: unknown, defaultError?: string) => void;
} => {
  const toast = useChakraToast();

  const renderError = (error: unknown, defaultError?: string) => {
    const errorMsg = getErrorMessage(error);

    if (USER_ERRORS.includes(errorMsg)) {
      return;
    }

    toast({
      description: getErrorMessage(error, defaultError),
      position: 'top',
      status: 'error',
    });
  };

  return { renderError };
};
