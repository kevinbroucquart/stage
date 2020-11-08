<?php


namespace App\Controller\Admin;


use App\Entity\GlobalPropertyAttribute;
use App\Entity\User;
use App\Repository\GlobalPropertyAttributeRepository;
use App\Service\LogService;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Class gpaManagement
 * @package App\Controller\Admin
 * @Route("/admin/gpa_management", name="adminController")
 * @IsGranted("ROLE_ADMIN")
 */
class gpaManagement extends AbstractController
{
    /**
     * @var LogService
     */
    private $logService;

    /**
     * Allows to log gpa events except GET methods
     * gpaManagement constructor.
     * @param LogService $logService
     */
    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }

// *******************************************************************************************************
// *****************************************   GET   *****************************************************
// *******************************************************************************************************

    /*-----------------------------      GET ALL GPA     -------------------------------------*/
    /**
     * Allows to recover all Global Property Attributes existing in DB
     * @Route("/get_all_gpa", name="getAllGPA", methods={"GET"})
     * @return Response
     * @author KBR
     */
    public function getGPA():Response
    {
        // Recover services in DB and try and catch exception
        try{
            $globalPropertyAttributes = $this->getDoctrine()->getRepository(GlobalPropertyAttribute::class)->findAll();
        }catch(\Exception $e){
            return new Response(
                json_encode(["error" => $e->getMessage()]),
                Response::HTTP_INTERNAL_SERVER_ERROR,
                ['Content-Type' => 'application/json']
            );
        }

        //Recover gpa informations, and put informations in a multidimentional array
        $responseContent = [];
        foreach ($globalPropertyAttributes as $gpa){
            if($gpa->getUser() !== null){
                $responseContent[$gpa->getId()] = [
                    'id'                => $gpa->getId(),
                    'user_id'           => $gpa->getUser()->getId(),
                    'property_key'      => $gpa->getPropertyKey(),
                    'property_value'    => $gpa->getPropertyValue(),
                    'scope'             => $gpa->getScope(),
                    'description'       => $gpa->getDescription(),
                ];
            }else{
                $responseContent[$gpa->getId()] = [
                    'id'                => $gpa->getId(),
                    'property_key'      => $gpa->getPropertyKey(),
                    'property_value'    => $gpa->getPropertyValue(),
                    'scope'             => $gpa->getScope(),
                    'description'       => $gpa->getDescription(),
                ];
            }
        }

        // Return all Global Property Attribute in JSON format
        $response = new Response(json_encode($responseContent));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    /*-----------------------------      GET A GPA BY ID     -------------------------------------*/
    /**
     * Allows to return a selected gpa by his ID
     * @Route("/get_gpa_by_id", name="getGpabyId", methods={"GET"})
     * @param Request $request
     * @return Response
     * @author KBR
     */
    public function getGPAbyId(Request $request): Response
    {
        // Recover selected gpa in DB and try and catch exception
        $gpaId = $request->query->get('id');
        try {
            $gpa = $this->getDoctrine()->getRepository(GlobalPropertyAttribute::class)->findOneBy($gpaId);
        }catch (\Exception $e){
            return new Response(
                json_encode(['error'=>$e->getMessage()]),
                Response::HTTP_INTERNAL_SERVER_ERROR,
                ['Content-Type'=>'application/json']
            );
        }

        // Recover selected Service informations, and put informations in a multidimentional tab
        $responseContent = [
            'id'                => $gpa->getId(),
            'user_id'           => $gpa->getUser(),
            'property_key'      => $gpa->getPropertyKey(),
            'property_value'    => $gpa->getPropertyValue(),
            'scope'             => $gpa->getScope(),
            'description'       => $gpa->getDescription(),
        ];

        // Return selected Service informations in JSON format
        $response = new Response(json_encode($responseContent));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

// *******************************************************************************************************
// *****************************************   POST   ****************************************************
// *******************************************************************************************************

    /*-----------------------------      CREATE A GPA      -------------------------------------*/
    /**
     * Allows to create a new global Property Attribute
     * @Route("/create_gpa", name="create_gpa", methods={"POST"})
     * @param Request $request
     * @param UserInterface $currentUser
     * @return Response
     * @author KBR
     */
    public function test(Request $request, UserInterface $currentUser)
    {
        // Prepare the response
        $response = new Response();
        $response->headers->set('Content-Type', 'application/json');

        $scope =            $request->request->get("scope");
        $userId =           $request->request->get('newGpaUserId');
        $propertyKey =      $request->request->get("propertyKey");
        $propertyValue =    $request->request->get('propertyValue');
        $description =      $request->request->get('description');

        $errors = [];
        $user = null;
        $allGPA = $this->getDoctrine()->getRepository(GlobalPropertyAttribute::class)->findAll();

        $isCompleted = TRUE;


        if(!isset($scope) || empty($scope)){
            $isCompleted = FALSE;
            $errors[] = "Le champs scope est obligatoire !";
        }

        if($scope !== "GLOBAL" && $scope !== "USER"){
            $isCompleted = FALSE;
            $errors[] = "Il y a une erreur de scope !";
        }

        if ($scope == "USER"){
            if (!isset($userId) || empty($userId)){
                $isCompleted = FALSE;
                $errors[] = "Vous devez choisir un utilisateur quand le scope = UTILISATEUR!";
            }
        }

        if ((isset($userId) || !empty($userId)) && ($scope == "USER")){
            $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(["id" => $userId]);
        }
        if((isset($userId) || !empty($userId)) && ($scope !== "USER")){
            $errors [] = "Un utilisateur a été donné dans un scope global";
        }

        foreach ($allGPA as $gpa){
            if(($scope == "GLOBAL") && ($gpa->getScope() == "GLOBAL"))
            {
                if($gpa->getPropertyKey() == $propertyKey )
                {
                    $isUnique = FALSE;
                    $errors = "Ce GPA existe déjà";
                    $response->setContent(json_encode($errors));
                    $response->setStatusCode(Response::HTTP_EXPECTATION_FAILED);
                    return $response;
                }
            }
            else if(($scope == "USER") && ($gpa->getScope() == "USER"))
            {
                if($gpa->getUser() == $user){
                    if($gpa->getPropertyKey() == $propertyKey){
                        $isUnique = FALSE;
                        $errors = "Ce GPA existe déjà pour cet l'utilisateur ";
                        $response->setContent(json_encode(["error" => $errors]));
                        $response->setStatusCode(Response::HTTP_EXPECTATION_FAILED);
                        return $response;
                    }
                }
            }
        }

        if (!isset($propertyKey) || empty($propertyKey)){
            $isCompleted = FALSE;
            $errors[] = "Le champs 'propertyKey' est obligatoire !";
        }

        if(!isset($propertyValue) || empty($propertyValue)){
            $isCompleted = FALSE;
            $errors[] = "Le champs 'propertyValue' est obligatoire !";
        }


        // Create GPA Object
        $em = $this->getDoctrine()->getManagerForClass(GlobalPropertyAttribute::class);
        $gpa = new GlobalPropertyAttribute();

        if($isCompleted){
            try{
                $gpa    ->setScope($scope)
                        ->setUser($user)
                        ->setPropertyKey($propertyKey)
                        ->setPropertyValue($propertyValue)
                        ->setDescription($description);
            }catch(\Exception $e){
                $response->setContent(json_encode(["error" => $e]));
                $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            try {
                $em->persist($gpa);
                $em->flush();
                $response->setContent(json_encode(["success" => TRUE, "message" => "GPA enregistré"]));
            } catch (\Exception $e) {
                $response->setContent(json_encode(["success" => FALSE, "error" => $e->getMessage()]));
                $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            //Put event in the database
            $this->logService->logEvents($currentUser, " ADMIN " .$currentUser->getUsername(). " a créé le gpa : clé : " .$propertyKey. " | valeur :  " .$propertyValue. "  | SCOPE : " .$scope. " " .$userId." | Description : " .$description);

            return $response;
        }else{

            $response->setContent(json_encode(["success" => FALSE, "error" => $errors]));
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
            return $response;
        }
    }

// ******************************************************************************************************
// *****************************************   PUT   ****************************************************
// ******************************************************************************************************

    /*-----------------------------      UPDATE A GPA      -------------------------------------*/
    /**
     * Allows to update selected gpa
     * @Route("/update_gpa", name="update_gpa", methods={"PUT"})
     * @param Request $request
     * @param UserInterface $currentUser
     * @return Response
     * @author KBR
     */
    public function updateGpa(Request $request, UserInterface $currentUser):Response
    {
        // Prepare the response
        $response = new Response();
        $response->headers->set('Content-Type', 'application/json');

        //Recover request params
        $gpaId =            $request->request->get('id');
        $propertyValue =    $request->request->get('propertyValue');
        $description =      $request->request->get('description');

        // Recover selected GPA in DB
        $gpa = $this->getDoctrine()->getRepository(GlobalPropertyAttribute::class)->findOneBy(["id" => $gpaId]);
        $em = $this->getDoctrine()->getManagerForClass(GlobalPropertyAttribute::class);

        // Update selected GPA
        try{
            if(isset($propertyValue) && !empty($propertyValue)){
                $gpa->setPropertyValue($propertyValue);
            }
            if(isset($description) && !empty($description)){
                $gpa->setDescription($description);
            }
        }catch(\Exception $e){
            $response->setContent(json_encode(["success" => FALSE, "error" => $e->getMessage()]));
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
            $this->logService->logError($e, $currentUser);
        }

        // Persist selected GPA
        try {
            $em->persist($gpa);
            $em->flush();
            $response->setContent(json_encode(["success" => TRUE]));
        }catch(\Exception $e){
            $response->setContent(json_encode(["success" => FALSE, "error" => $e->getMessage()]));
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        //Put event in the database
        $this->logService->logEvents($currentUser, " ADMIN " .$currentUser->getUsername(). " a modifié le gpa : clé : " .$gpa->getPropertyKey(). " | valeur :  " .$gpa->getPropertyValue(). "  | SCOPE : " .$gpa->getScope(). " | Description : " .$gpa->getDescription());

        // Return response (TRUE or FALSE) in JSON format
        return $response;
    }

// ******************************************************************************************************
// *****************************************   DELETE   *************************************************
// ******************************************************************************************************

    /*-----------------------------      DELETE A GPA      -------------------------------------*/
    /**
     * Allows to delete a GPA definitely from DB
     * @Route("/delete_gpa", name="delete_gpa", methods={"DELETE"})
     * @param Request $request
     * @param UserInterface $currentUser
     * @return Response
     * @author KBR
     */
    public function deleteGPA(Request $request, UserInterface $currentUser):Response
    {
        // Prepare the response
        $response = new Response();
        $response->headers->set('Content-Type', 'application/json');

        // Recover params
        $gpaId = $request->query->get("id");

        // Recover GPA object to delete
        $em = $this->getDoctrine()->getManagerForClass(GlobalPropertyAttribute::class);
        $gpa = new GlobalPropertyAttribute();
        try {
            $gpa = $em->getRepository(GlobalPropertyAttribute::class)->findOneBy(["id" => $gpaId]);
        }catch(\Exception $e){
            $response->setContent(json_encode(["success" => FALSE, "error" => $e->getMessage()]));
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Remove selected GPA
        try{
            $em->remove($gpa);
            $em->flush();
            $response->setContent(json_encode(["success" => TRUE]));
        }catch(\Exception $e){
            $response->setContent(json_encode(["success" => FALSE, "error" => $e->getMessage()]));
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Return response (TRUE or FALSE) in JSON format
        return $response;
    }
}