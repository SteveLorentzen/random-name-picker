import * as React from 'react'
import 'firebase/firestore'

import { useFirestore, useFirestoreCollectionData, useUser } from 'reactfire'
import { Button } from '@chakra-ui/react'

import StudentGroupPreview from 'components/StudentGroupPreview'
import { IStudentGroup } from 'interfacesAndTypes/interfacesAndTypes'
import NewStudentGroup from 'components/NewStudentGroup'
import { useHistory } from 'react-router-dom'

const StudentGroups: React.FC = () => {
  const { data: user } = useUser()
  const history = useHistory()

  const studentGroupsRef = useFirestore().collection('teachers').doc(user.uid).collection('studentGroups')
  const studentGroupsDocuments = useFirestoreCollectionData<IStudentGroup & { docId: string }>(studentGroupsRef, {
    idField: 'docId',
  })

  const manageStudentsHandler = () => {
    history.push('/manage-students')
  }

  return (
    <>
      <NewStudentGroup studentGroupsRef={studentGroupsRef} />
      <Button onClick={manageStudentsHandler}>Manage Students</Button>
      {studentGroupsDocuments.data?.map(doc => {
        return (
          <StudentGroupPreview
            key={doc.docId}
            studentGroupId={doc.docId}
            studentGroupName={doc.studentGroupName}
            userId={user.uid}
          />
        )
      })}
    </>
  )
}

export default StudentGroups
