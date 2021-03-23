import * as React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import NewStudent from 'components/NewStudent'
import { useFirestore, useUser } from 'reactfire'

type CreateNewStudentModalProps = {
  isOpen: boolean
  onClose: () => void
}

const CreateNewStudentModal: React.FC<CreateNewStudentModalProps> = ({ isOpen, onClose }) => {
  const { data: user } = useUser()

  const studentsRef = useFirestore().collection('teachers').doc(user.uid).collection('students')

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxHeight="90vh" overflowY="auto">
        <ModalHeader>Create New Student</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <NewStudent studentsRef={studentsRef} onClose={onClose} />
        </ModalBody>

        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateNewStudentModal
