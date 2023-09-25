import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { parseAbi } from 'viem';
import { Address, usePublicClient, useWalletClient } from 'wagmi';

import { TransactionPending } from '@/components/TransactionPending';
import { useActions } from '@/contexts/ActionsContext';
import { useGame } from '@/contexts/GameContext';
import { waitUntilBlock } from '@/hooks/useGraphHealth';

export const RenounceCharacterModal: React.FC = () => {
  const { game, reload: reloadGame } = useGame();
  const { selectedCharacter, renounceCharacterModal } = useActions();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const toast = useToast();

  const [isRenouncing, setIsRenouncing] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSynced, setIsSynced] = useState<boolean>(false);

  const resetData = useCallback(() => {
    setIsRenouncing(false);
    setTxHash(null);
    setIsSyncing(false);
    setIsSynced(false);
  }, []);

  useEffect(() => {
    if (!renounceCharacterModal?.isOpen) {
      resetData();
    }
  }, [resetData, renounceCharacterModal?.isOpen]);

  const onRenounceCharacter = useCallback(
    async (e: React.FormEvent<HTMLDivElement>) => {
      e.preventDefault();

      if (!walletClient) {
        toast({
          description: 'Wallet client is not connected.',
          position: 'top',
          status: 'error',
        });
        console.error('Could not find a wallet client.');
        return;
      }

      if (!game) {
        toast({
          description: `Could not find the game.`,
          position: 'top',
          status: 'error',
        });
        console.error(`Missing game data.`);
        return;
      }

      if (!selectedCharacter) {
        toast({
          description: 'Character not found.',
          position: 'top',
          status: 'error',
        });
        console.error('Character not found.');
        return;
      }

      setIsRenouncing(true);

      try {
        const transactionhash = await walletClient.writeContract({
          chain: walletClient.chain,
          account: walletClient.account?.address as Address,
          address: game.id as Address,
          abi: parseAbi([
            'function renounceSheet(uint256 _characterId) public',
          ]),
          functionName: 'renounceSheet',
          args: [BigInt(selectedCharacter.characterId)],
        });
        setTxHash(transactionhash);

        const client = publicClient ?? walletClient;
        const receipt = await client.waitForTransactionReceipt({
          hash: transactionhash,
        });

        setIsSyncing(true);
        const synced = await waitUntilBlock(receipt.blockNumber);

        if (!synced) {
          toast({
            description: 'Something went wrong while syncing.',
            position: 'top',
            status: 'warning',
          });
          return;
        }
        setIsSynced(true);
        reloadGame();
      } catch (e) {
        toast({
          description: `Something went wrong while renouncing ${selectedCharacter.name}`,
          position: 'top',
          status: 'error',
        });
        console.error(e);
      } finally {
        setIsSyncing(false);
        setIsRenouncing(false);
      }
    },
    [game, publicClient, reloadGame, selectedCharacter, toast, walletClient],
  );

  const isLoading = isRenouncing;
  const isDisabled = isLoading;

  const content = () => {
    if (isSynced) {
      return (
        <VStack py={10} spacing={4}>
          <Text>Your character has been renounced!</Text>
          <Button onClick={renounceCharacterModal?.onClose} variant="outline">
            Close
          </Button>
        </VStack>
      );
    }

    if (txHash && selectedCharacter) {
      return (
        <TransactionPending
          isSyncing={isSyncing}
          text={`Renouncing your character...`}
          txHash={txHash}
        />
      );
    }

    return (
      <VStack as="form" onSubmit={onRenounceCharacter} spacing={8}>
        <Text textAlign="center">
          Are you sure you want to renounce your character? This action is
          irreversible.
        </Text>
        <Button
          autoFocus
          isDisabled={isDisabled}
          isLoading={isLoading}
          loadingText="Renouncing..."
          type="submit"
        >
          Renounce
        </Button>
      </VStack>
    );
  };

  return (
    <Modal
      closeOnEsc={!isLoading}
      closeOnOverlayClick={!isLoading}
      isOpen={renounceCharacterModal?.isOpen ?? false}
      onClose={renounceCharacterModal?.onClose ?? (() => {})}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text>Renounce Character</Text>
          <ModalCloseButton size="lg" />
        </ModalHeader>
        <ModalBody>{content()}</ModalBody>
      </ModalContent>
    </Modal>
  );
};
