import Share from '~/server/models/Share';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;

    if (!id) {
      return { success: false, error: 'Shared document ID is required' };
    }

    console.log('Deleting shared document with ID:', id);

    connectToDatabase();

    // Delete the shared document from the Share model
    const result = await Share.findByIdAndDelete(id);

    if (!result) {
      return { success: false, error: 'Shared document not found' };
    }

    return { success: true, message: 'Shared document deleted successfully' };
  } catch (error) {
    console.error('Error deleting shared document:', error);
    return { success: false, error: 'Failed to delete shared document' };
  }
});