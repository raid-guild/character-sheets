import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Switch,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  encodeAbiParameters,
  isAddress,
  maxUint256,
  pad,
  parseAbi,
} from 'viem';
import { Address, usePublicClient, useWalletClient } from 'wagmi';

import { TransactionPending } from '@/components/TransactionPending';
import { useGame } from '@/contexts/GameContext';
import { waitUntilBlock } from '@/hooks/useGraphHealth';
import { useUploadFile } from '@/hooks/useUploadFile';

type CreateItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const toast = useToast();

  const { game, reload: reloadGame } = useGame();

  const {
    file: itemEmblem,
    setFile: setItemEmblem,
    onRemove,
    onUpload,
    isUploading,
    isUploaded,
  } = useUploadFile({ fileName: 'itemEmblem' });

  const [itemName, setItemName] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [itemSupply, setItemSupply] = useState<string>('');
  const [classRequirementsToggle, setClassRequirementsToggle] =
    useState<boolean>(false);
  const [classRequirements, setClassRequirements] = useState<string[]>([]);
  const [soulboundToggle, setSoulboundToggle] = useState<boolean>(false);
  const [claimableToggle, setClaimableToggle] = useState<boolean>(false);
  const [whitelistedClaimers, setWhitelistedClaimers] = useState<string>('');

  const [showError, setShowError] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSynced, setIsSynced] = useState<boolean>(false);

  const invalidItemDescription = useMemo(() => {
    return itemDescription.length > 200 && !!itemDescription;
  }, [itemDescription]);

  const invalidItemSupply = useMemo(() => {
    return (
      !itemSupply ||
      BigInt(itemSupply).toString() === 'NaN' ||
      BigInt(itemSupply) <= BigInt(0) ||
      BigInt(itemSupply) > maxUint256
    );
  }, [itemSupply]);

  const invalidClaimerAddress = useMemo(() => {
    const addresses = whitelistedClaimers.split(',');
    const trimmedAddresses = addresses.map(address => address.trim());
    return (
      trimmedAddresses.some(address => !isAddress(address)) &&
      !!whitelistedClaimers
    );
  }, [whitelistedClaimers]);

  const hasError = useMemo(() => {
    return (
      !itemDescription ||
      !itemEmblem ||
      !itemName ||
      invalidItemDescription ||
      !itemSupply ||
      invalidItemSupply ||
      invalidClaimerAddress
    );
  }, [
    itemDescription,
    itemEmblem,
    itemName,
    invalidClaimerAddress,
    invalidItemDescription,
    itemSupply,
    invalidItemSupply,
  ]);

  const resetData = useCallback(() => {
    setItemName('');
    setItemDescription('');
    setItemSupply('');
    setClassRequirementsToggle(false);
    setClassRequirements([]);
    setSoulboundToggle(false);
    setClaimableToggle(false);
    setWhitelistedClaimers('');
    setItemEmblem(null);

    setShowError(false);

    setIsCreating(false);
    setTxHash(null);
    setIsSyncing(false);
    setIsSynced(false);
  }, [setItemEmblem]);

  useEffect(() => {
    if (!isOpen) {
      resetData();
    }
  }, [resetData, isOpen]);

  const onCreateItem = useCallback(
    async (e: React.FormEvent<HTMLDivElement>) => {
      e.preventDefault();

      if (hasError) {
        setShowError(true);
        return;
      }

      if (!walletClient) {
        toast({
          description: 'Wallet client is not connected.',
          position: 'top',
          status: 'error',
        });
        console.error('Could not find a wallet client.');
        return;
      }

      if (!(game && game.itemsAddress)) {
        toast({
          description: `Could not find an item factory for the ${walletClient.chain.name} network.`,
          position: 'top',
          status: 'error',
        });
        console.error(
          `Missing item factory address for the ${walletClient.chain.name} network"`,
        );
        return;
      }

      const cid = await onUpload();

      if (!cid) {
        toast({
          description: 'Something went wrong uploading your item emblem.',
          position: 'top',
          status: 'error',
        });
        return;
      }

      const itemMetadata = {
        name: itemName,
        description: itemDescription,
        image: `ipfs://${cid}`,
      };

      setIsCreating(true);

      try {
        const res = await fetch('/api/uploadMetadata?name=itemMetadata.json', {
          method: 'POST',
          body: JSON.stringify(itemMetadata),
        });

        if (!res.ok) {
          toast({
            description: 'Something went wrong uploading your item metadata.',
            position: 'top',
            status: 'error',
          });
          return;
        }

        const { cid: itemMetadataCid } = await res.json();

        if (!itemMetadataCid) {
          toast({
            description: 'Something went wrong uploading your item metadata.',
            position: 'top',
            status: 'error',
          });
          return;
        }

        const claimable = pad('0x00');

        //TODO: the claimable addresses still need added to requirements

        // if (claimableToggle) {
        //   const addresses = whitelistedClaimers.split(',');
        //   const trimmedAddresses = addresses.map(address => address.trim());

        //   if (trimmedAddresses.length === 0) {
        //     claimable = pad('0x01');
        //   }
        // }

        const requiredClassIds = classRequirements.map(cr => BigInt(cr));
        const requiredClassCategories = requiredClassIds.map(() => 2);
        const requiredClassAddresses = requiredClassIds.map(
          () => game.classesAddress as Address,
        );
        // TODO: Make amount dynamic when class levels are added
        const requiredClassAmounts = requiredClassIds.map(() => BigInt(1));

        // TODO: item and XP requirements still need added
        const requiredAssetsBytes = encodeAbiParameters(
          [
            {
              name: 'requiredAssetCategories',
              type: 'uint8[]',
            },
            {
              name: 'requiredAssetAddresses',
              type: 'address[]',
            },
            {
              name: 'requiredAssetIds',
              type: 'uint256[]',
            },
            {
              name: 'requiredAssetAmounts',
              type: 'uint256[]',
            },
          ],
          [
            [...requiredClassCategories],
            [...requiredClassAddresses],
            [...requiredClassIds],
            [...requiredClassAmounts],
          ],
        );

        const encodedItemCreationData = encodeAbiParameters(
          [
            {
              name: 'craftable',
              type: 'bool',
            },
            {
              name: 'soulbound',
              type: 'bool',
            },
            {
              name: 'claimable',
              type: 'bytes32',
            },
            {
              name: 'supply',
              type: 'uint256',
            },
            {
              name: 'cid',
              type: 'string',
            },
            {
              name: 'requiredAssets',
              type: 'bytes',
            },
          ],
          [
            false,
            soulboundToggle,
            claimable,
            BigInt(itemSupply),
            itemMetadataCid,
            requiredAssetsBytes,
          ],
        );

        const transactionhash = await walletClient.writeContract({
          chain: walletClient.chain,
          account: walletClient.account?.address as Address,
          address: game.itemsAddress as Address,
          abi: parseAbi([
            'function createItemType(bytes calldata itemData) external returns (uint256)',
          ]),
          functionName: 'createItemType',
          args: [encodedItemCreationData],
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
          description: 'Something went wrong creating your item.',
          position: 'top',
          status: 'error',
        });
        console.error(e);
      } finally {
        setIsSyncing(false);
        setIsCreating(false);
      }
    },
    [
      classRequirements,
      itemName,
      itemDescription,
      itemSupply,
      game,
      reloadGame,
      hasError,
      onUpload,
      publicClient,
      soulboundToggle,
      toast,
      walletClient,
    ],
  );

  const isLoading = isCreating;
  const isDisabled = isLoading || isUploading;

  const content = () => {
    if (isSynced) {
      return (
        <VStack py={10} spacing={4}>
          <Text>Your item was successfully created!</Text>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </VStack>
      );
    }

    if (txHash) {
      return (
        <TransactionPending
          isSyncing={isSyncing}
          text="Your item is being created."
          txHash={txHash}
        />
      );
    }

    return (
      <VStack as="form" onSubmit={onCreateItem} spacing={8}>
        <FormControl isInvalid={showError && !itemName}>
          <FormLabel>Item Name</FormLabel>
          <Input
            onChange={e => setItemName(e.target.value)}
            type="text"
            value={itemName}
          />
          {showError && !itemName && (
            <FormHelperText color="red">
              An item name is required
            </FormHelperText>
          )}
        </FormControl>
        <FormControl isInvalid={showError && !itemDescription}>
          <FormLabel>Item Description (200 character limit)</FormLabel>
          <Textarea
            onChange={e => setItemDescription(e.target.value)}
            value={itemDescription}
          />
          {showError && !itemDescription && (
            <FormHelperText color="red">
              An item description is required
            </FormHelperText>
          )}
          {showError && invalidItemDescription && (
            <FormHelperText color="red">
              Item description must be less than 200 characters
            </FormHelperText>
          )}
        </FormControl>
        <FormControl isInvalid={showError && !itemSupply}>
          <FormLabel>Item Supply</FormLabel>
          <Input
            onChange={e => setItemSupply(e.target.value)}
            type="number"
            value={itemSupply}
          />
          {showError && !itemSupply && (
            <FormHelperText color="red">
              An item supply is required
            </FormHelperText>
          )}
        </FormControl>
        <FormControl isInvalid={showError && !itemSupply}>
          <FormLabel>Require certain classes to claim? (tooltip)</FormLabel>
          <Switch
            isChecked={classRequirementsToggle}
            onChange={e => setClassRequirementsToggle(e.target.checked)}
          />
        </FormControl>

        {classRequirementsToggle && (
          <SimpleGrid columns={4} spacing={3} w="100%">
            {game?.classes.map(c => (
              <Button
                h="200px"
                key={c.id}
                onClick={() => {
                  if (classRequirements.includes(c.classId)) {
                    setClassRequirements(
                      classRequirements.filter(cr => cr !== c.classId),
                    );
                  } else {
                    setClassRequirements([...classRequirements, c.classId]);
                  }
                }}
                variant="unstyled"
                width="100%"
              >
                <VStack
                  background={
                    classRequirements.includes(c.classId) ? 'black' : 'white'
                  }
                  border="3px solid black"
                  borderBottom="5px solid black"
                  borderRight="5px solid black"
                  color={
                    classRequirements.includes(c.classId) ? 'white' : 'black'
                  }
                  cursor="pointer"
                  fontWeight={600}
                  h="100%"
                  justify="space-between"
                  px={5}
                  py={3}
                >
                  <Image
                    alt={`${c.name} image`}
                    h="70%"
                    objectFit="contain"
                    src={c.image}
                    w="100%"
                  />
                  <Text textAlign="center" fontSize="14px">
                    {c.name}
                  </Text>
                </VStack>
              </Button>
            ))}
          </SimpleGrid>
        )}
        <FormControl isInvalid={showError && !itemSupply}>
          <FormLabel>Is this item soulbound? (tooltip)</FormLabel>
          <Switch
            isChecked={soulboundToggle}
            onChange={e => setSoulboundToggle(e.target.checked)}
          />
        </FormControl>
        <FormControl isInvalid={showError && !itemSupply}>
          <FormLabel>Allow players to claim? (tooltip)</FormLabel>
          <Switch
            isChecked={claimableToggle}
            onChange={e => setClaimableToggle(e.target.checked)}
          />
        </FormControl>
        {claimableToggle && (
          <FormControl isInvalid={showError && invalidClaimerAddress}>
            <FormLabel>
              Whitelisted claimers (if left empty, any player can claim)
            </FormLabel>
            <Input
              onChange={e => setWhitelistedClaimers(e.target.value)}
              value={whitelistedClaimers}
            />
            {showError && invalidClaimerAddress && (
              <FormHelperText color="red">
                Invalid claimer address
              </FormHelperText>
            )}
          </FormControl>
        )}
        <FormControl isInvalid={showError && !itemEmblem}>
          <FormLabel>Item Emblem</FormLabel>
          {!itemEmblem && (
            <Input
              accept=".png, .jpg, .jpeg, .svg"
              disabled={isUploading}
              onChange={e => setItemEmblem(e.target.files?.[0] ?? null)}
              type="file"
              variant="file"
            />
          )}
          {itemEmblem && (
            <Flex align="center" gap={10} mt={4}>
              <Image
                alt="item emblem"
                objectFit="contain"
                src={URL.createObjectURL(itemEmblem)}
                w="300px"
              />
              <Button
                isDisabled={isUploading || isUploaded}
                isLoading={isUploading}
                loadingText="Uploading..."
                mt={4}
                onClick={!isUploaded ? onRemove : undefined}
                type="button"
                variant="outline"
              >
                {isUploaded ? 'Uploaded' : 'Remove'}
              </Button>
            </Flex>
          )}
          {showError && !itemEmblem && (
            <FormHelperText color="red">
              An item emblem is required
            </FormHelperText>
          )}
        </FormControl>
        <Button
          alignSelf="flex-end"
          isDisabled={isDisabled}
          isLoading={isLoading}
          loadingText="Creating..."
          type="submit"
        >
          Create
        </Button>
      </VStack>
    );
  };

  return (
    <Modal
      closeOnEsc={!isLoading}
      closeOnOverlayClick={!isLoading}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text>Create an Item</Text>
          <ModalCloseButton size="lg" />
        </ModalHeader>
        <ModalBody>{content()}</ModalBody>
      </ModalContent>
    </Modal>
  );
};
