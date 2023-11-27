import {
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useGame } from '@/contexts/GameContext';
import { Character } from '@/utils/types';

import { ItemCard } from '../ItemCard';

type ItemsCatalogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  character?: Character;
};

export const ItemsCatalogModal: React.FC<ItemsCatalogModalProps> = ({
  character,
  isOpen,
  onClose,
}) => {
  const { game } = useGame();

  const items = character?.heldItems || game?.items || [];

  return (
    <Modal closeOnEsc closeOnOverlayClick isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Items Catalog ({items.length})</Text>
          </HStack>
          <ModalCloseButton size="lg" />
        </ModalHeader>
        <ModalBody>
          <VStack spacing={6} w="100%">
            {game &&
              items.map(item => (
                <ItemCard
                  key={item.id}
                  chainId={game.chainId}
                  holderId={character?.characterId}
                  {...item}
                />
              ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
