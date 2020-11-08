<?php

namespace App\Entity;

use App\Repository\GlobalPropertyAttributeRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=GlobalPropertyAttributeRepository::class)
 */
class GlobalPropertyAttribute
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $propertyKey;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $propertyValue;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $scope;

    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="GPA")
     */
    private $user;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $description;

    public function serialize()
    {
        $responseContent = [
            'property_key'       => $this->propertyKey,
            'property_value'     => $this->propertyValue,
        ];
        return $responseContent;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPropertyKey(): ?string
    {
        return $this->propertyKey;
    }

    public function setPropertyKey(string $propertyKey): self
    {
        $this->propertyKey = $propertyKey;

        return $this;
    }

    public function getPropertyValue(): ?string
    {
        return $this->propertyValue;
    }

    public function setPropertyValue(string $propertyValue): self
    {
        $this->propertyValue = $propertyValue;

        return $this;
    }

    public function getScope(): ?string
    {
        return $this->scope;
    }

    public function setScope(string $scope): self
    {
        $this->scope = $scope;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }
}
