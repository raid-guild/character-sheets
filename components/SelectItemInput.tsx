import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
} from '@chakra-ui/react';

import { MultiSourceImage } from '@/components/MultiSourceImage';
import { Item } from '@/utils/types';

type SelectItemInputProps = {
  selectedItem: Item | null;
  setSelectedItem: (item: Item) => void;
  items: Item[];
  noItemsText?: string;
};

export const SelectItemInput: React.FC<SelectItemInputProps> = ({
  selectedItem,
  setSelectedItem,
  items,
  noItemsText = 'No items available',
}) => {
  return (
    <Menu>
      <Tooltip label={items.length === 0 ? noItemsText : ''}>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          w="100%"
          h="2.675rem"
          isDisabled={items.length === 0}
        >
          {selectedItem ? (
            <ItemEntry item={selectedItem} />
          ) : (
            <Text>Select Item</Text>
          )}
        </MenuButton>
      </Tooltip>
      <MenuList minW="20rem">
        {items.map((item: Item) => (
          <MenuItem key={item.id} onClick={() => setSelectedItem(item)}>
            <ItemEntry item={item} />
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

const ItemEntry: React.FC<{ item: Item }> = ({ item }) => {
  const { name, image } = item;
  return (
    <HStack spacing={4} justify="space-between" w="100%">
      <Text fontSize="md" fontWeight="bold">
        {name}
      </Text>
      <MultiSourceImage
        alt={`${name} image`}
        h="32px"
        w="32px"
        src={image}
        objectFit="contain"
      />
    </HStack>
  );
};
