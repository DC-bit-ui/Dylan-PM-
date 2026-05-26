import { Alert, AlertIcon, Box, Heading, Text } from '@chakra-ui/react';

// Generic placeholder for tabs that haven't been ported yet.
// Each tab will get its own component as it's rewritten.

export function PlaceholderPage({
  name,
  v2Anchor,
}: {
  name: string;
  v2Anchor: string;
}) {
  return (
    <Box>
      <Heading size="lg" letterSpacing="-0.5px" mb={1}>
        {name}
      </Heading>
      <Text fontSize="sm" color="gray.500" mb={6}>
        This tab hasn't been ported to React yet. Use the v2 dashboard while it's rebuilt.
      </Text>
      <Alert status="info" rounded="md">
        <AlertIcon />
        For now, open the existing <code>/v2/#{v2Anchor}</code> view in another tab to use this surface.
      </Alert>
    </Box>
  );
}
