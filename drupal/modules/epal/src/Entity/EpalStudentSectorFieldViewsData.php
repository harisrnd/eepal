<?php

namespace Drupal\epal\Entity;

use Drupal\views\EntityViewsData;

/**
 * Provides Views data for Epal student sector field entities.
 */
class EpalStudentSectorFieldViewsData extends EntityViewsData {

  /**
   * {@inheritdoc}
   */
  public function getViewsData() {
    $data = parent::getViewsData();

    // Additional information for Views integration, such as table joins, can be
    // put here.

    return $data;
  }

}
