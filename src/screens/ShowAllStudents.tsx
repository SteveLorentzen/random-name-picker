import * as React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useUser, useFirestore, useFirestoreCollectionData, useFirestoreDocData } from 'reactfire'
import { Heading, IconButton, Flex, Box } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { IStudentInStudentGroup, Params, IStudentGroup } from 'interfacesAndTypes/interfacesAndTypes'
import StudentInGroup from 'components/StudentInGroup'

const ShowAllStudents: React.FC = () => {
  const params: Params = useParams()
  const history = useHistory()
  const studentGroupId = params.groupId
  const { data: user } = useUser()

  const teacherRef = useFirestore().collection('teachers').doc(user.uid)

  const studentGroupRef = teacherRef.collection('studentGroups').doc(studentGroupId)
  const studentGroupDoc = useFirestoreDocData<IStudentGroup & { docId: string }>(studentGroupRef).data
  const studentsInStudentGroupsRef = teacherRef.collection('studentsInStudentGroups')

  const studentsInThisStudentGroupRef = studentsInStudentGroupsRef.where('studentGroupId', '==', studentGroupId)
  const studentsInThisStudentGroupDocuments = useFirestoreCollectionData<IStudentInStudentGroup & { docId: string }>(
    studentsInThisStudentGroupRef,
    { idField: 'docId' },
  ).data

  const backHandler = () => {
    history.push(`/student-group/${studentGroupId}`)
  }

  return (
    <Flex w="90%" direction="column" align="center" margin="auto">
      <Box h="100px" position="relative" w="100%" textAlign="center">
        <IconButton
          onClick={backHandler}
          icon={<ArrowBackIcon />}
          aria-label="back"
          position="absolute"
          top="10px"
          left="10px"
        />
        <Heading as="h1" marginTop="25px">
          {`All Students in ${studentGroupDoc?.studentGroupName}`}
        </Heading>
      </Box>
      {studentsInThisStudentGroupDocuments?.map(doc => {
        return <StudentInGroup key={doc.docId} studentName={doc.studentName} studentInStudentGroupId={doc.docId} />
      })}
    </Flex>
  )
}

export default ShowAllStudents